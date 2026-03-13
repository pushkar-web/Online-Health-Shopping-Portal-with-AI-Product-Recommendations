package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.dto.ProductDTO;
import com.healthshop.model.Product;
import com.healthshop.model.UserHealthProfile;
import com.healthshop.repository.ProductRepository;
import com.healthshop.repository.UserHealthProfileRepository;
import com.healthshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * RAG (Retrieval-Augmented Generation) Agent
 * Combines knowledge base retrieval with Groq LLM for intelligent health assistant responses.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RAGAgent {

    private final GroqService groqService;
    private final RAGKnowledgeBase knowledgeBase;
    private final ProductRepository productRepository;
    private final UserHealthProfileRepository healthProfileRepository;
    private final ProductService productService;

    private static final String SYSTEM_PROMPT = """
            You are HealthBot AI, an expert health and wellness assistant for an online health products store.
            You help users find the right health supplements, vitamins, and wellness products based on their needs.

            IMPORTANT GUIDELINES:
            - Always be empathetic, professional, and helpful
            - Recommend specific products from our store when relevant (mention product names and prices)
            - Provide evidence-based health information
            - Always include a disclaimer that you're an AI assistant and not a medical professional
            - If symptoms sound severe, strongly recommend consulting a healthcare provider
            - Base your recommendations on the provided context from our product database
            - Keep responses concise but informative (2-4 paragraphs max)
            - Use simple language that anyone can understand
            - When recommending products, explain WHY they're beneficial for the user's specific concern
            - Format with markdown: use **bold** for product names and key points, bullet points for lists
            - If the user's question isn't health-related, politely redirect them to health topics
            """;

    /**
     * Main RAG chat endpoint — retrieves context and generates a response via Groq LLM
     */
    public AIDTO.RAGChatResponse chat(String userMessage, Long userId, List<Map<String, String>> history) {
        long startTime = System.currentTimeMillis();
        log.info("RAG Agent processing query: '{}' for userId: {}", truncate(userMessage, 50), userId);

        // Step 1: Retrieve relevant context from knowledge base
        String context = knowledgeBase.getContextForQuery(userMessage, 8);
        List<RAGKnowledgeBase.KnowledgeChunk> relevantChunks = knowledgeBase.retrieve(userMessage, 8);

        // Step 2: Enrich context with user's health profile (if authenticated)
        String userContext = "";
        if (userId != null) {
            userContext = getUserProfileContext(userId);
        }

        // Step 3: Build augmented prompt
        String augmentedPrompt = buildAugmentedPrompt(context, userContext, userMessage);

        // Step 4: Generate response via Groq LLM
        String aiResponse = groqService.chat(SYSTEM_PROMPT, augmentedPrompt, history);

        // Step 5: Extract relevant products to recommend alongside the response
        List<ProductDTO.ProductResponse> suggestedProducts = extractRelevantProducts(userMessage, relevantChunks);

        // Step 6: Generate follow-up suggestions
        List<String> followUpSuggestions = generateFollowUpSuggestions(userMessage, aiResponse);

        // Step 7: Determine source types used
        List<String> sources = relevantChunks.stream()
                .map(c -> c.getType() + ": " + c.getTitle())
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        long duration = System.currentTimeMillis() - startTime;
        log.info("RAG Agent response generated in {}ms, {} products suggested", duration, suggestedProducts.size());

        return AIDTO.RAGChatResponse.builder()
                .message(aiResponse)
                .suggestedProducts(suggestedProducts)
                .followUpQuestions(followUpSuggestions)
                .sources(sources)
                .responseTimeMs(duration)
                .knowledgeChunksUsed(relevantChunks.size())
                .build();
    }

    /**
     * Quick query — no history, no user context
     */
    public AIDTO.RAGChatResponse quickQuery(String query) {
        return chat(query, null, List.of());
    }

    /**
     * Product recommendation query — focused on finding the best products
     */
    public AIDTO.RAGChatResponse recommendProducts(String healthConcern, Long userId) {
        String enrichedQuery = "I need product recommendations for: " + healthConcern +
                ". Please suggest the best products from your store with prices and explain why each is beneficial.";
        return chat(enrichedQuery, userId, List.of());
    }

    /**
     * Health education query — focused on providing health information
     */
    public AIDTO.RAGChatResponse healthEducation(String topic) {
        String enrichedQuery = "Please provide detailed health education about: " + topic +
                ". Include recommended supplements, lifestyle tips, and relevant products from the store.";
        return chat(enrichedQuery, null, List.of());
    }

    /**
     * Symptom analysis — uses a specialized system prompt for symptom checking via Groq LLM
     */
    public AIDTO.SymptomAnalysisResponse analyzeSymptoms(String symptoms, Long userId, List<Map<String, String>> history) {
        long startTime = System.currentTimeMillis();
        log.info("RAG Symptom Analysis for: '{}'", truncate(symptoms, 50));

        String context = knowledgeBase.getContextForQuery(symptoms, 10);
        List<RAGKnowledgeBase.KnowledgeChunk> relevantChunks = knowledgeBase.retrieve(symptoms, 10);

        String userContext = "";
        if (userId != null) {
            userContext = getUserProfileContext(userId);
        }

        String augmentedPrompt = buildSymptomPrompt(context, userContext, symptoms);
        String symptomSystemPrompt = """
                You are HealthBot AI Symptom Analyzer, a specialized health symptom analysis assistant.
                You analyze user-described symptoms and provide structured health guidance.

                RESPONSE FORMAT — You MUST respond in this exact JSON format (no extra text outside JSON):
                {
                  "analysis": "A detailed 2-3 paragraph analysis of the symptoms described, possible causes, and recommended actions.",
                  "severity": "mild|moderate|severe",
                  "identifiedSymptoms": ["symptom1", "symptom2"],
                  "possibleConditions": ["condition1", "condition2"],
                  "lifestyleTips": ["tip1", "tip2", "tip3"],
                  "dietaryRecommendations": ["rec1", "rec2"],
                  "whenToSeeDoctor": "Guidance on when professional medical help is needed",
                  "supplementKeywords": ["keyword1", "keyword2"]
                }

                SEVERITY RULES:
                - "mild": General wellness concerns, fatigue, mild aches, nutrition questions
                - "moderate": Persistent symptoms, recurring pain, sleep disorders, chronic conditions
                - "severe": Chest pain, breathing difficulty, severe pain, emergency symptoms, bleeding

                GUIDELINES:
                - Be empathetic and professional
                - Always recommend consulting a doctor for severe or persistent symptoms
                - Base supplement recommendations on the provided product context
                - Include practical, actionable lifestyle tips
                - Identify specific symptoms from the user's description
                - Suggest possible conditions but emphasize you're not a diagnostic tool
                - Provide dietary recommendations relevant to the symptoms
                """;

        String aiResponse = groqService.chat(symptomSystemPrompt, augmentedPrompt, history);

        // Parse the structured JSON response from Groq
        AIDTO.SymptomAnalysisResponse response = parseSymptomResponse(aiResponse);

        // Extract products based on supplement keywords from AI + chunk context
        List<String> searchTerms = new ArrayList<>();
        if (response.getSupplementKeywords() != null) searchTerms.addAll(response.getSupplementKeywords());
        if (response.getIdentifiedSymptoms() != null) searchTerms.addAll(response.getIdentifiedSymptoms());
        List<ProductDTO.ProductResponse> products = extractRelevantProducts(
                String.join(" ", searchTerms) + " " + symptoms, relevantChunks);
        response.setSuggestedProducts(products);

        // Sources
        List<String> sources = relevantChunks.stream()
                .map(c -> c.getType() + ": " + c.getTitle())
                .distinct().limit(5).collect(Collectors.toList());
        response.setSources(sources);

        // Follow-ups
        response.setFollowUpQuestions(generateSymptomFollowUps(symptoms, response));

        long duration = System.currentTimeMillis() - startTime;
        response.setResponseTimeMs(duration);
        response.setKnowledgeChunksUsed(relevantChunks.size());

        log.info("Symptom analysis completed in {}ms, severity: {}", duration, response.getSeverity());
        return response;
    }

    private String buildSymptomPrompt(String context, String userContext, String symptoms) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("=== PRODUCT DATABASE CONTEXT ===\n");
        prompt.append(context);
        prompt.append("\n");
        if (!userContext.isEmpty()) {
            prompt.append("=== USER HEALTH PROFILE ===\n");
            prompt.append(userContext).append("\n");
        }
        prompt.append("=== SYMPTOMS DESCRIBED ===\n");
        prompt.append(symptoms);
        prompt.append("\n\nAnalyze these symptoms and respond in the required JSON format. ");
        prompt.append("Use the product database context to suggest relevant supplement keywords.");
        return prompt.toString();
    }

    private AIDTO.SymptomAnalysisResponse parseSymptomResponse(String aiResponse) {
        AIDTO.SymptomAnalysisResponse response = new AIDTO.SymptomAnalysisResponse();
        try {
            // Extract JSON from the response (AI might wrap it in markdown code blocks)
            String json = aiResponse;
            if (json.contains("```json")) {
                json = json.substring(json.indexOf("```json") + 7);
                json = json.substring(0, json.indexOf("```"));
            } else if (json.contains("```")) {
                json = json.substring(json.indexOf("```") + 3);
                json = json.substring(0, json.indexOf("```"));
            }
            json = json.trim();

            // Parse using simple string extraction (avoid adding jackson-databind dependency overhead)
            response.setAnalysis(extractJsonString(json, "analysis"));
            response.setSeverity(extractJsonString(json, "severity"));
            response.setIdentifiedSymptoms(extractJsonArray(json, "identifiedSymptoms"));
            response.setPossibleConditions(extractJsonArray(json, "possibleConditions"));
            response.setLifestyleTips(extractJsonArray(json, "lifestyleTips"));
            response.setDietaryRecommendations(extractJsonArray(json, "dietaryRecommendations"));
            response.setWhenToSeeDoctor(extractJsonString(json, "whenToSeeDoctor"));
            response.setSupplementKeywords(extractJsonArray(json, "supplementKeywords"));

        } catch (Exception e) {
            log.warn("Failed to parse structured symptom response, using raw: {}", e.getMessage());
            response.setAnalysis(aiResponse);
            response.setSeverity("mild");
            response.setIdentifiedSymptoms(List.of());
            response.setPossibleConditions(List.of());
            response.setLifestyleTips(List.of());
            response.setDietaryRecommendations(List.of());
            response.setWhenToSeeDoctor("If symptoms persist, please consult a healthcare provider.");
            response.setSupplementKeywords(List.of());
        }

        // Validate severity
        if (response.getSeverity() == null || !List.of("mild", "moderate", "severe").contains(response.getSeverity())) {
            response.setSeverity("mild");
        }

        return response;
    }

    private String extractJsonString(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return "";
        int colonIndex = json.indexOf(":", keyIndex);
        if (colonIndex == -1) return "";
        int quoteStart = json.indexOf("\"", colonIndex + 1);
        if (quoteStart == -1) return "";
        // Find the closing quote, handling escaped quotes
        int quoteEnd = quoteStart + 1;
        while (quoteEnd < json.length()) {
            if (json.charAt(quoteEnd) == '"' && json.charAt(quoteEnd - 1) != '\\') break;
            quoteEnd++;
        }
        return json.substring(quoteStart + 1, quoteEnd).replace("\\n", "\n").replace("\\\"", "\"");
    }

    private List<String> extractJsonArray(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return List.of();
        int bracketStart = json.indexOf("[", keyIndex);
        if (bracketStart == -1) return List.of();
        int bracketEnd = json.indexOf("]", bracketStart);
        if (bracketEnd == -1) return List.of();
        String arrayContent = json.substring(bracketStart + 1, bracketEnd);
        List<String> items = new ArrayList<>();
        // Extract quoted strings
        int pos = 0;
        while (pos < arrayContent.length()) {
            int qs = arrayContent.indexOf("\"", pos);
            if (qs == -1) break;
            int qe = qs + 1;
            while (qe < arrayContent.length()) {
                if (arrayContent.charAt(qe) == '"' && arrayContent.charAt(qe - 1) != '\\') break;
                qe++;
            }
            if (qe < arrayContent.length()) {
                items.add(arrayContent.substring(qs + 1, qe).replace("\\\"", "\""));
            }
            pos = qe + 1;
        }
        return items;
    }

    private List<String> generateSymptomFollowUps(String symptoms, AIDTO.SymptomAnalysisResponse response) {
        List<String> followUps = new ArrayList<>();
        String lower = symptoms.toLowerCase();
        if ("severe".equals(response.getSeverity())) {
            followUps.add("What should I do while waiting to see a doctor?");
            followUps.add("Are there any emergency signs I should watch for?");
        }
        if (lower.contains("pain") || lower.contains("ache")) {
            followUps.add("What natural remedies can help with this pain?");
        }
        if (lower.contains("tired") || lower.contains("fatigue") || lower.contains("energy")) {
            followUps.add("What vitamins can boost my energy levels?");
        }
        if (lower.contains("sleep") || lower.contains("insomnia")) {
            followUps.add("What supplements help improve sleep quality?");
        }
        if (lower.contains("stress") || lower.contains("anxiety")) {
            followUps.add("What are natural ways to manage stress?");
        }
        if (lower.contains("digest") || lower.contains("stomach") || lower.contains("bloat")) {
            followUps.add("What probiotics do you recommend?");
        }
        if (followUps.isEmpty()) {
            followUps.add("What supplements would you recommend for this?");
            followUps.add("How can I prevent this in the future?");
            followUps.add("Should I see a specialist?");
        }
        return followUps.stream().distinct().limit(3).collect(Collectors.toList());
    }

    /**
     * Get knowledge base stats for admin dashboard
     */
    public Map<String, Object> getRAGStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalChunks", knowledgeBase.getChunkCount());
        stats.put("chunksByType", knowledgeBase.getChunkCountByType());
        stats.put("status", knowledgeBase.getChunkCount() > 0 ? "active" : "initializing");
        stats.put("model", "llama-3.3-70b-versatile (Groq)");
        return stats;
    }

    // ========== PRIVATE HELPERS ==========

    private String buildAugmentedPrompt(String context, String userContext, String userMessage) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("=== KNOWLEDGE BASE CONTEXT ===\n");
        prompt.append(context);
        prompt.append("\n");

        if (!userContext.isEmpty()) {
            prompt.append("=== USER HEALTH PROFILE ===\n");
            prompt.append(userContext);
            prompt.append("\n");
        }

        prompt.append("=== USER QUESTION ===\n");
        prompt.append(userMessage);
        prompt.append("\n\nPlease provide a helpful, personalized response based on the above context. ");
        prompt.append("Recommend specific products by name when relevant. Keep your response focused and actionable.");

        return prompt.toString();
    }

    private String getUserProfileContext(Long userId) {
        try {
            Optional<UserHealthProfile> profileOpt = healthProfileRepository.findByUserId(userId);
            if (profileOpt.isEmpty()) return "";

            UserHealthProfile profile = profileOpt.get();
            StringBuilder sb = new StringBuilder();
            if (profile.getAge() != null) sb.append("Age: ").append(profile.getAge()).append(". ");
            if (profile.getGender() != null) sb.append("Gender: ").append(profile.getGender()).append(". ");
            if (profile.getHealthGoals() != null) sb.append("Health goals: ").append(profile.getHealthGoals()).append(". ");
            if (profile.getAllergies() != null) sb.append("Allergies: ").append(profile.getAllergies()).append(". ");
            if (profile.getMedicalConditions() != null) sb.append("Medical conditions: ").append(profile.getMedicalConditions()).append(". ");
            if (profile.getDietaryPreferences() != null) sb.append("Dietary preferences: ").append(profile.getDietaryPreferences()).append(". ");
            return sb.toString();
        } catch (Exception e) {
            log.error("Error loading user profile for RAG: {}", e.getMessage());
            return "";
        }
    }

    private List<ProductDTO.ProductResponse> extractRelevantProducts(String query, List<RAGKnowledgeBase.KnowledgeChunk> chunks) {
        Set<Long> productIds = new LinkedHashSet<>();

        // Get product IDs from relevant chunks
        for (RAGKnowledgeBase.KnowledgeChunk chunk : chunks) {
            if ("product".equals(chunk.getType())) {
                try {
                    productIds.add(Long.parseLong(chunk.getSourceId()));
                } catch (NumberFormatException e) {
                    // skip non-numeric IDs
                }
            }
        }

        // Also do a keyword-based product search
        String[] queryWords = query.toLowerCase().split("\\W+");
        for (String word : queryWords) {
            if (word.length() >= 4) {
                try {
                    List<Product> found = productRepository.findByTag(word);
                    for (Product p : found) {
                        productIds.add(p.getId());
                        if (productIds.size() >= 8) break;
                    }
                } catch (Exception e) {
                    // skip
                }
            }
            if (productIds.size() >= 8) break;
        }

        return productIds.stream()
                .limit(8)
                .map(id -> productRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .map(productService::toResponse)
                .collect(Collectors.toList());
    }

    private List<String> generateFollowUpSuggestions(String userMessage, String aiResponse) {
        String lowerMsg = userMessage.toLowerCase();
        List<String> suggestions = new ArrayList<>();

        if (lowerMsg.contains("vitamin") || lowerMsg.contains("supplement")) {
            suggestions.add("What are the recommended dosages?");
            suggestions.add("Are there any interactions I should know about?");
        }
        if (lowerMsg.contains("pain") || lowerMsg.contains("ache")) {
            suggestions.add("What lifestyle changes can help?");
            suggestions.add("Should I consult a doctor for this?");
        }
        if (lowerMsg.contains("sleep") || lowerMsg.contains("insomnia")) {
            suggestions.add("What's the best time to take sleep supplements?");
            suggestions.add("Are there natural alternatives?");
        }
        if (lowerMsg.contains("immune") || lowerMsg.contains("immunity") || lowerMsg.contains("cold")) {
            suggestions.add("What vitamins boost immunity the most?");
            suggestions.add("How can I prevent getting sick?");
        }
        if (lowerMsg.contains("weight") || lowerMsg.contains("diet") || lowerMsg.contains("fat")) {
            suggestions.add("What supplements help with weight management?");
            suggestions.add("What dietary changes do you recommend?");
        }

        // Default follow-ups
        if (suggestions.isEmpty()) {
            suggestions.add("Can you recommend specific products for me?");
            suggestions.add("What are the potential side effects?");
            suggestions.add("How long until I see results?");
        }

        return suggestions.stream().distinct().limit(3).collect(Collectors.toList());
    }

    private String truncate(String text, int maxLen) {
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...";
    }
}
