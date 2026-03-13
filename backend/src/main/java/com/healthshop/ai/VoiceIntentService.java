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
public class VoiceIntentService {

    private final GroqService groqService;
    private final RAGAgent ragAgent;
    private final ProductRepository productRepository;
    private final ProductService productService;

    private static final String INTENT_SYSTEM_PROMPT = """
            You are a voice intent parser for a health supplement store. Parse the user's spoken text and determine the primary action.

            RESPOND ONLY WITH JSON — no extra text:
            {
              "action": "SEARCH" | "ADD_TO_CART" | "CHAT" | "SYMPTOM_CHECK",
              "query": "the relevant search or chat query",
              "productName": "specific product name if mentioned, or empty string",
              "quantity": 1
            }

            CLASSIFICATION RULES:
            - ONLY use SEARCH if user EXPLICITLY says "search for", "find me", "show me", "look for" + a specific product name
            - ONLY use ADD_TO_CART if user EXPLICITLY says "add to cart", "buy", "order", "put in cart" + a specific product name
            - Use SYMPTOM_CHECK if user describes physical symptoms: pain, ache, fatigue, nausea, fever, rash, etc.
            - Use CHAT for EVERYTHING ELSE: health questions, nutrition advice, supplement info, general conversation, greetings, what to take for X, recommendations, comparisons, "what is", "how does", "tell me about", "is X good for Y"

            IMPORTANT: When in doubt, default to CHAT. Most queries should be CHAT.
            Examples classified as CHAT (NOT SEARCH):
            - "What's good for immunity?" → CHAT
            - "Tell me about vitamin D" → CHAT
            - "What should I take for better sleep?" → CHAT
            - "Hello" or "Hi there" → CHAT
            - "What are the best supplements for energy?" → CHAT
            - "Is ashwagandha safe?" → CHAT
            - "How much vitamin C should I take daily?" → CHAT
            """;

    public AIDTO.VoiceIntentResponse processVoiceIntent(String transcript, Long userId) {
        long startTime = System.currentTimeMillis();
        log.info("Processing voice intent: '{}'", transcript);

        // Step 1: Parse intent via Groq
        String intentJson;
        AIDTO.VoiceIntentResponse response;
        try {
            intentJson = groqService.chat(INTENT_SYSTEM_PROMPT, transcript);
            response = parseIntentResponse(intentJson, transcript);
        } catch (Exception e) {
            log.warn("Intent parsing failed, defaulting to RAG chat: {}", e.getMessage());
            response = new AIDTO.VoiceIntentResponse();
            response.setAction("CHAT");
            response.setQuery(transcript);
        }

        // Step 2: Execute action — RAG agent is the primary brain for all actions
        try {
            switch (response.getAction()) {
                case "SEARCH":
                    handleSearch(response, transcript, userId);
                    break;

                case "ADD_TO_CART":
                    handleAddToCart(response, transcript, userId);
                    break;

                case "SYMPTOM_CHECK":
                    handleSymptomCheck(response, transcript, userId);
                    break;

                case "CHAT":
                default:
                    handleChat(response, transcript, userId);
                    break;
            }
        } catch (Exception e) {
            log.error("Error processing voice action '{}': {}", response.getAction(), e.getMessage());
            // Final fallback — always give a useful response
            response.setAction("CHAT");
            response.setSpokenResponse("I'd be happy to help with that. Could you try rephrasing your question? " +
                    "You can ask me about health supplements, symptoms, nutrition advice, or search for specific products.");
        }

        response.setResponseTimeMs(System.currentTimeMillis() - startTime);
        return response;
    }

    private void handleSearch(AIDTO.VoiceIntentResponse response, String transcript, Long userId) {
        String searchQuery = response.getQuery() != null && !response.getQuery().isEmpty()
                ? response.getQuery() : transcript;

        // Try product DB search first
        List<Product> found = productRepository.findByTag(searchQuery);
        List<ProductDTO.ProductResponse> products = found.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .limit(6)
                .map(productService::toResponse)
                .collect(Collectors.toList());

        if (!products.isEmpty()) {
            response.setProducts(products);
            response.setSpokenResponse("I found " + products.size() + " products for " + searchQuery + ". Here are the top results.");
        } else {
            // No products found — fall back to RAG agent for an intelligent answer
            log.info("No products found for SEARCH '{}', falling back to RAG agent", searchQuery);
            AIDTO.RAGChatResponse chatResult = ragAgent.chat(transcript, userId, List.of());
            response.setAction("CHAT");
            response.setSpokenResponse(truncateForSpeech(chatResult.getMessage()));
            response.setDetailedResponse(chatResult.getMessage());
            if (chatResult.getSuggestedProducts() != null && !chatResult.getSuggestedProducts().isEmpty()) {
                response.setProducts(chatResult.getSuggestedProducts());
            }
        }
    }

    private void handleAddToCart(AIDTO.VoiceIntentResponse response, String transcript, Long userId) {
        if (response.getProductName() != null && !response.getProductName().isEmpty()) {
            List<Product> matches = productRepository.findByTag(response.getProductName());
            if (!matches.isEmpty()) {
                Product match = matches.get(0);
                response.setProducts(List.of(productService.toResponse(match)));
                response.setProductId(match.getId());
                response.setSpokenResponse("I found " + match.getName() + " priced at $" +
                        (match.getDiscountPrice() != null ? match.getDiscountPrice() : match.getPrice()) +
                        ". Would you like me to add it to your cart?");
                response.setRequiresConfirmation(true);
                return;
            }
        }
        // Product not found — use RAG to help the user
        log.info("Product not found for ADD_TO_CART, falling back to RAG agent");
        AIDTO.RAGChatResponse chatResult = ragAgent.chat(
                "I want to buy: " + transcript + ". Please suggest the best matching products from our store.", userId, List.of());
        response.setAction("CHAT");
        response.setSpokenResponse(truncateForSpeech(chatResult.getMessage()));
        response.setDetailedResponse(chatResult.getMessage());
        if (chatResult.getSuggestedProducts() != null) {
            response.setProducts(chatResult.getSuggestedProducts());
        }
    }

    private void handleSymptomCheck(AIDTO.VoiceIntentResponse response, String transcript, Long userId) {
        AIDTO.SymptomAnalysisResponse symptomResult = ragAgent.analyzeSymptoms(transcript, userId, List.of());
        response.setSpokenResponse(truncateForSpeech(symptomResult.getAnalysis()));
        response.setProducts(symptomResult.getSuggestedProducts());
        response.setDetailedResponse(symptomResult.getAnalysis());
        response.setSeverity(symptomResult.getSeverity());
    }

    private void handleChat(AIDTO.VoiceIntentResponse response, String transcript, Long userId) {
        AIDTO.RAGChatResponse chatResult = ragAgent.chat(transcript, userId, List.of());
        response.setSpokenResponse(truncateForSpeech(chatResult.getMessage()));
        response.setProducts(chatResult.getSuggestedProducts());
        response.setDetailedResponse(chatResult.getMessage());
    }

    private AIDTO.VoiceIntentResponse parseIntentResponse(String json, String originalTranscript) {
        AIDTO.VoiceIntentResponse response = new AIDTO.VoiceIntentResponse();
        try {
            if (json.contains("```json")) {
                json = json.substring(json.indexOf("```json") + 7);
                json = json.substring(0, json.indexOf("```"));
            } else if (json.contains("```")) {
                json = json.substring(json.indexOf("```") + 3);
                json = json.substring(0, json.indexOf("```"));
            }
            json = json.trim();

            response.setAction(extractField(json, "action"));
            response.setQuery(extractField(json, "query"));
            response.setProductName(extractField(json, "productName"));
            try {
                String qty = extractField(json, "quantity");
                response.setQuantity(qty.isEmpty() ? 1 : Integer.parseInt(qty.replaceAll("[^0-9]", "")));
            } catch (Exception e) {
                response.setQuantity(1);
            }
        } catch (Exception e) {
            log.warn("Failed to parse voice intent JSON, falling back to CHAT: {}", e.getMessage());
            response.setAction("CHAT");
            response.setQuery(originalTranscript);
        }

        if (response.getAction() == null || response.getAction().isEmpty()) {
            response.setAction("CHAT");
        }
        return response;
    }

    private String extractField(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return "";
        int colonIndex = json.indexOf(":", keyIndex);
        if (colonIndex == -1) return "";

        String rest = json.substring(colonIndex + 1).trim();
        if (rest.startsWith("\"")) {
            int qEnd = 1;
            while (qEnd < rest.length()) {
                if (rest.charAt(qEnd) == '"' && rest.charAt(qEnd - 1) != '\\') break;
                qEnd++;
            }
            return rest.substring(1, qEnd);
        }
        // number or other
        int end = rest.indexOf(",");
        if (end == -1) end = rest.indexOf("}");
        if (end == -1) end = rest.length();
        return rest.substring(0, end).trim().replaceAll("[\"\\s]", "");
    }

    private String truncateForSpeech(String text) {
        if (text == null) return "I'm having trouble generating a response right now. Please try again.";
        // Strip markdown
        String clean = text.replaceAll("\\*\\*", "").replaceAll("\\*", "")
                .replaceAll("#+\\s", "").replaceAll("- ", ". ")
                .replaceAll("\\[.*?\\]\\(.*?\\)", "").replaceAll("`", "");
        // Keep it short for TTS (up to 4 sentences to give a complete answer)
        String[] sentences = clean.split("(?<=[.!?])\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(4, sentences.length); i++) {
            sb.append(sentences[i]).append(" ");
        }
        String result = sb.toString().trim();
        // Cap at 500 chars for smooth TTS
        if (result.length() > 500) {
            result = result.substring(0, 497) + "...";
        }
        return result;
    }
}
