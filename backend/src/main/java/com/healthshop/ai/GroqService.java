package com.healthshop.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GroqService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String model;

    @Value("${groq.api.max-tokens:2048}")
    private int maxTokens;

    @Value("${groq.api.temperature:0.7}")
    private double temperature;

    public GroqService(
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.url}") String apiUrl) {
        this.objectMapper = new ObjectMapper();
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(5 * 1024 * 1024))
                .build();
        log.info("GroqService initialized with API URL: {}", apiUrl);
    }

    /**
     * Send a chat completion request to Groq API with system context and user message
     */
    public String chat(String systemPrompt, String userMessage) {
        return chat(systemPrompt, userMessage, List.of());
    }

    /**
     * Send a chat completion request with conversation history
     */
    public String chat(String systemPrompt, String userMessage, List<Map<String, String>> history) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);
            requestBody.put("stream", false);

            ArrayNode messages = requestBody.putArray("messages");

            // System message
            ObjectNode sysMsg = messages.addObject();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);

            // Conversation history
            if (history != null) {
                for (Map<String, String> msg : history) {
                    ObjectNode histMsg = messages.addObject();
                    histMsg.put("role", msg.getOrDefault("role", "user"));
                    histMsg.put("content", msg.getOrDefault("content", ""));
                }
            }

            // User message
            ObjectNode userMsg = messages.addObject();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);

            String requestJson = objectMapper.writeValueAsString(requestBody);

            String responseJson = webClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestJson)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode responseNode = objectMapper.readTree(responseJson);
            JsonNode choices = responseNode.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                return choices.get(0).get("message").get("content").asText();
            }

            log.warn("No choices in Groq response: {}", responseJson);
            return "I'm sorry, I couldn't generate a response. Please try again.";

        } catch (Exception e) {
            log.error("Error calling Groq API: {}", e.getMessage(), e);
            return "I'm experiencing connectivity issues. Please try again in a moment.";
        }
    }

    /**
     * Generate embeddings-like similarity score using keyword matching
     * (Groq doesn't provide embeddings, so we use TF-IDF-like scoring)
     */
    public double calculateSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) return 0.0;
        String[] words1 = text1.toLowerCase().split("\\W+");
        String[] words2 = text2.toLowerCase().split("\\W+");

        java.util.Set<String> set1 = new java.util.HashSet<>(java.util.Arrays.asList(words1));
        java.util.Set<String> set2 = new java.util.HashSet<>(java.util.Arrays.asList(words2));

        long intersection = set1.stream().filter(set2::contains).count();
        long union = set1.size() + set2.size() - intersection;

        return union == 0 ? 0 : (double) intersection / union;
    }
}
