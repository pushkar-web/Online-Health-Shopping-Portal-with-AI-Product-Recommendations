package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.dto.ProductDTO;
import com.healthshop.model.Product;
import com.healthshop.repository.ProductRepository;
import com.healthshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplementScanService {

    private final GroqService groqService;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final RAGKnowledgeBase knowledgeBase;

    private static final String SCAN_SYSTEM_PROMPT = """
            You are a supplement label analyzer. Given OCR text from a supplement bottle label, extract and analyze the ingredients.

            RESPOND ONLY WITH JSON:
            {
              "productName": "The product name from the label",
              "brand": "Brand name if visible",
              "supplementType": "vitamin|mineral|herbal|protein|probiotic|other",
              "ingredients": [
                {"name": "Chemical/scientific name", "commonName": "Common name", "amount": "dosage amount", "unit": "mg/mcg/IU/etc"},
              ],
              "allergens": ["list of allergens mentioned"],
              "warnings": ["any warnings on the label"],
              "summary": "A brief 1-2 sentence summary of what this supplement is for"
            }

            RULES:
            - Normalize chemical names: pyridoxine hydrochloride → Vitamin B6, cholecalciferol → Vitamin D3, etc.
            - Extract ALL ingredients including inactive/other ingredients
            - Note any "free from" claims (gluten-free, vegan, etc.)
            - If OCR text is garbled or unclear, do your best and mark uncertain items
            """;

    public AIDTO.ScanAnalysisResponse analyzeScan(String ocrText, List<String> userAllergies) {
        long startTime = System.currentTimeMillis();
        log.info("Analyzing scanned supplement label ({} chars)", ocrText.length());

        // Step 1: Extract ingredients via Groq
        String aiResponse = groqService.chat(SCAN_SYSTEM_PROMPT, "OCR TEXT FROM LABEL:\n" + ocrText);
        AIDTO.ScanAnalysisResponse response = parseScanResponse(aiResponse);

        // Step 2: Check allergens against user profile
        List<AIDTO.ScanAllergenAlert> allergenAlerts = new ArrayList<>();
        if (userAllergies != null && !userAllergies.isEmpty()) {
            Set<String> userAllergySet = userAllergies.stream()
                    .map(String::toLowerCase).collect(Collectors.toSet());

            if (response.getAllergens() != null) {
                for (String allergen : response.getAllergens()) {
                    if (userAllergySet.stream().anyMatch(a -> allergen.toLowerCase().contains(a) || a.contains(allergen.toLowerCase()))) {
                        allergenAlerts.add(AIDTO.ScanAllergenAlert.builder()
                                .allergen(allergen).severity("high")
                                .message("This product contains " + allergen + " which is in your allergy list!").build());
                    }
                }
            }
            // Also check ingredients for common allergens
            if (response.getIngredients() != null) {
                for (AIDTO.ScanIngredient ing : response.getIngredients()) {
                    String name = (ing.getName() + " " + ing.getCommonName()).toLowerCase();
                    for (String allergy : userAllergySet) {
                        if (name.contains(allergy)) {
                            allergenAlerts.add(AIDTO.ScanAllergenAlert.builder()
                                    .allergen(ing.getCommonName().isEmpty() ? ing.getName() : ing.getCommonName())
                                    .severity("high")
                                    .message("Ingredient '" + ing.getName() + "' may trigger your " + allergy + " allergy").build());
                        }
                    }
                }
            }
        }
        response.setAllergenAlerts(allergenAlerts);

        // Step 3: Find matching store products
        Set<String> searchTerms = new LinkedHashSet<>();
        if (response.getIngredients() != null) {
            for (AIDTO.ScanIngredient ing : response.getIngredients()) {
                if (!ing.getCommonName().isEmpty()) searchTerms.add(ing.getCommonName().toLowerCase());
                if (!ing.getName().isEmpty()) searchTerms.add(ing.getName().toLowerCase().split("\\s+")[0]);
            }
        }
        if (response.getSupplementType() != null) searchTerms.add(response.getSupplementType());

        List<ProductDTO.ProductResponse> matchingProducts = new ArrayList<>();
        Set<Long> addedIds = new HashSet<>();
        for (String term : searchTerms) {
            if (term.length() < 3) continue;
            try {
                List<Product> found = productRepository.findByTag(term);
                for (Product p : found) {
                    if (Boolean.TRUE.equals(p.getActive()) && addedIds.add(p.getId())) {
                        matchingProducts.add(productService.toResponse(p));
                        if (matchingProducts.size() >= 8) break;
                    }
                }
            } catch (Exception ignored) {}
            if (matchingProducts.size() >= 8) break;
        }
        response.setMatchingProducts(matchingProducts);
        response.setSafetyScore(calculateSafetyScore(allergenAlerts));
        response.setResponseTimeMs(System.currentTimeMillis() - startTime);

        return response;
    }

    private int calculateSafetyScore(List<AIDTO.ScanAllergenAlert> alerts) {
        if (alerts == null || alerts.isEmpty()) return 100;
        int highCount = (int) alerts.stream().filter(a -> "high".equals(a.getSeverity())).count();
        int medCount = (int) alerts.stream().filter(a -> "medium".equals(a.getSeverity())).count();
        return Math.max(0, 100 - (highCount * 30) - (medCount * 10));
    }

    private AIDTO.ScanAnalysisResponse parseScanResponse(String aiResponse) {
        AIDTO.ScanAnalysisResponse response = new AIDTO.ScanAnalysisResponse();
        try {
            String json = aiResponse;
            if (json.contains("```json")) {
                json = json.substring(json.indexOf("```json") + 7);
                json = json.substring(0, json.indexOf("```"));
            } else if (json.contains("```")) {
                json = json.substring(json.indexOf("```") + 3);
                json = json.substring(0, json.indexOf("```"));
            }
            json = json.trim();

            response.setProductName(extractStr(json, "productName"));
            response.setBrand(extractStr(json, "brand"));
            response.setSupplementType(extractStr(json, "supplementType"));
            response.setSummary(extractStr(json, "summary"));
            response.setAllergens(extractArr(json, "allergens"));
            response.setWarnings(extractArr(json, "warnings"));

            // Parse ingredients array
            List<AIDTO.ScanIngredient> ingredients = new ArrayList<>();
            int ingStart = json.indexOf("\"ingredients\"");
            if (ingStart != -1) {
                int arrStart = json.indexOf("[", ingStart);
                int arrEnd = findMatchingBracket(json, arrStart);
                if (arrStart != -1 && arrEnd != -1) {
                    String arrStr = json.substring(arrStart + 1, arrEnd);
                    int objStart = 0;
                    while ((objStart = arrStr.indexOf("{", objStart)) != -1) {
                        int objEnd = arrStr.indexOf("}", objStart);
                        if (objEnd == -1) break;
                        String obj = arrStr.substring(objStart, objEnd + 1);
                        AIDTO.ScanIngredient ing = AIDTO.ScanIngredient.builder()
                                .name(extractStr(obj, "name"))
                                .commonName(extractStr(obj, "commonName"))
                                .amount(extractStr(obj, "amount"))
                                .unit(extractStr(obj, "unit"))
                                .build();
                        ingredients.add(ing);
                        objStart = objEnd + 1;
                    }
                }
            }
            response.setIngredients(ingredients);

        } catch (Exception e) {
            log.warn("Failed to parse scan response: {}", e.getMessage());
            response.setProductName("Unknown Product");
            response.setSummary(aiResponse);
            response.setIngredients(List.of());
            response.setAllergens(List.of());
            response.setWarnings(List.of());
        }
        return response;
    }

    private int findMatchingBracket(String s, int openPos) {
        if (openPos == -1) return -1;
        int depth = 0;
        for (int i = openPos; i < s.length(); i++) {
            if (s.charAt(i) == '[') depth++;
            else if (s.charAt(i) == ']') { depth--; if (depth == 0) return i; }
        }
        return -1;
    }

    private String extractStr(String json, String key) {
        String sk = "\"" + key + "\"";
        int ki = json.indexOf(sk);
        if (ki == -1) return "";
        int ci = json.indexOf(":", ki);
        if (ci == -1) return "";
        int qs = json.indexOf("\"", ci + 1);
        if (qs == -1) return "";
        int qe = qs + 1;
        while (qe < json.length()) {
            if (json.charAt(qe) == '"' && json.charAt(qe - 1) != '\\') break;
            qe++;
        }
        return qe < json.length() ? json.substring(qs + 1, qe) : "";
    }

    private List<String> extractArr(String json, String key) {
        String sk = "\"" + key + "\"";
        int ki = json.indexOf(sk);
        if (ki == -1) return List.of();
        int bs = json.indexOf("[", ki);
        if (bs == -1) return List.of();
        int be = json.indexOf("]", bs);
        if (be == -1) return List.of();
        String arr = json.substring(bs + 1, be);
        List<String> items = new ArrayList<>();
        int pos = 0;
        while (pos < arr.length()) {
            int qs = arr.indexOf("\"", pos);
            if (qs == -1) break;
            int qe = qs + 1;
            while (qe < arr.length()) {
                if (arr.charAt(qe) == '"' && arr.charAt(qe - 1) != '\\') break;
                qe++;
            }
            if (qe < arr.length()) items.add(arr.substring(qs + 1, qe));
            pos = qe + 1;
        }
        return items;
    }
}
