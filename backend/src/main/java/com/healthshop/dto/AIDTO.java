package com.healthshop.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

public class AIDTO {

    // ========== Health Score ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HealthScoreResponse {
        private Integer overallScore; // 0-100
        private String grade; // A+, A, B+, B, C, D
        private String summary;
        private List<ScoreDimension> dimensions;
        private List<String> improvements;
        private List<ProductDTO.ProductResponse> recommendedProducts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScoreDimension {
        private String name; // e.g. "Nutrition", "Fitness", "Sleep"
        private Integer score; // 0-100
        private String status; // "excellent", "good", "fair", "poor"
        private String tip;
    }

    // ========== Drug Interaction Checker ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InteractionCheckRequest {
        private List<Long> productIds;
        private List<String> currentMedications;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InteractionCheckResponse {
        private List<InteractionWarning> warnings;
        private List<InteractionInfo> safeCombinatons;
        private String overallRisk; // "none", "low", "moderate", "high"
        private List<String> generalAdvice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InteractionWarning {
        private String severity; // "critical", "moderate", "mild"
        private String product1;
        private String product2;
        private String description;
        private String recommendation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InteractionInfo {
        private String product1;
        private String product2;
        private String benefit;
    }

    // ========== Smart Product Comparison ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonRequest {
        private List<Long> productIds; // 2-4 product IDs
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonResponse {
        private List<ComparisonProduct> products;
        private Long aiRecommendedId;
        private String aiRecommendationReason;
        private List<ComparisonDimension> dimensions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonProduct {
        private Long id;
        private String name;
        private String brand;
        private Double price;
        private Double discountPrice;
        private Double rating;
        private Integer reviewCount;
        private String imageUrl;
        private List<String> healthGoals;
        private String dietaryInfo;
        private String dosage;
        private String ingredients;
        private Map<String, String> scores; // dimension -> score label
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonDimension {
        private String name;
        private String description;
    }

    // ========== Personalized Dosage Calculator ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DosageRequest {
        private Long productId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DosageResponse {
        private String productName;
        private String recommendedDosage;
        private String timing; // "Morning", "Night", "With meals"
        private String frequency; // "Once daily", "Twice daily"
        private List<String> tips;
        private List<String> warnings;
        private String personalizedNote;
    }

    // ========== Purchase Pattern Analysis ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PurchaseInsights {
        private Integer totalOrders;
        private Double totalSpent;
        private String topCategory;
        private List<String> topHealthGoals;
        private List<MonthlySpend> spendingTrend;
        private List<ProductDTO.ProductResponse> reorderSuggestions;
        private String nextPurchasePrediction;
        private List<String> insights;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlySpend {
        private String month;
        private Double amount;
        private Integer orderCount;
    }

    // ========== AI Health Insights ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HealthInsightsResponse {
        private HealthScoreResponse healthScore;
        private PurchaseInsights purchaseInsights;
        private List<ProductDTO.ProductResponse> personalizedPicks;
        private List<HealthTip> dailyTips;
        private NutritionGapAnalysis nutritionGaps;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HealthTip {
        private String icon;
        private String title;
        private String description;
        private String category; // "nutrition", "fitness", "sleep", "mental"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NutritionGapAnalysis {
        private List<NutritionGap> gaps;
        private List<ProductDTO.ProductResponse> suggestedProducts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NutritionGap {
        private String nutrient;
        private String currentStatus; // "deficient", "low", "adequate", "optimal"
        private Integer fulfillmentPercent;
        private String recommendation;
    }

    // ========== Enhanced Symptom Chat ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatMessage {
        private String role; // "user" or "assistant"
        private String content;
        private List<ProductDTO.ProductResponse> products;
        private List<String> followUpQuestions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatRequest {
        private String message;
        private List<ChatMessage> history;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatResponse {
        private String message;
        private List<String> identifiedSymptoms;
        private List<String> suggestedCategories;
        private List<ProductDTO.ProductResponse> suggestedProducts;
        private List<String> followUpQuestions;
        private String severity; // "mild", "moderate", "consult-doctor"
        private List<String> lifestyleTips;
    }

    // ========== Admin AI Dashboard ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminAIStatsResponse {
        private Integer totalHealthProfiles;
        private List<LabelValue> topHealthGoals;
        private List<LabelValue> topSymptoms; // inferred or mocked
        private List<LabelValue> ageGroupDistribution;
        private Double avgHealthScore;
        private List<String> recentAiActivity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabelValue {
        private String label;
        private Long value;
    }

    // ========== RAG Agent ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RAGChatRequest {
        private String message;
        private List<Map<String, String>> history;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RAGChatResponse {
        private String message;
        private List<ProductDTO.ProductResponse> suggestedProducts;
        private List<String> followUpQuestions;
        private List<String> sources;
        private Long responseTimeMs;
        private Integer knowledgeChunksUsed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RAGQuickQuery {
        private String query;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RAGRecommendRequest {
        private String healthConcern;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RAGEducationRequest {
        private String topic;
    }

    // ========== Symptom Analysis (RAG + Groq) ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SymptomAnalysisRequest {
        private String symptoms;
        private List<Map<String, String>> history;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SymptomAnalysisResponse {
        private String analysis;
        private String severity; // "mild", "moderate", "severe"
        private List<String> identifiedSymptoms;
        private List<String> possibleConditions;
        private List<String> lifestyleTips;
        private List<String> dietaryRecommendations;
        private String whenToSeeDoctor;
        private List<String> supplementKeywords;
        private List<ProductDTO.ProductResponse> suggestedProducts;
        private List<String> followUpQuestions;
        private List<String> sources;
        private Long responseTimeMs;
        private Integer knowledgeChunksUsed;
    }

    // ========== Voice Assistant ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VoiceIntentRequest { private String transcript; }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VoiceIntentResponse {
        private String action;
        private String query;
        private String productName;
        private Integer quantity;
        private Long productId;
        private String spokenResponse;
        private String detailedResponse;
        private String severity;
        private List<ProductDTO.ProductResponse> products;
        private Boolean requiresConfirmation;
        private Long responseTimeMs;
    }

    // ========== Supplement Scanner ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ScanRequest { private String ocrText; private List<String> userAllergies; }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ScanAnalysisResponse {
        private String productName;
        private String brand;
        private String supplementType;
        private String summary;
        private List<ScanIngredient> ingredients;
        private List<String> allergens;
        private List<String> warnings;
        private List<ScanAllergenAlert> allergenAlerts;
        private List<ProductDTO.ProductResponse> matchingProducts;
        private Integer safetyScore;
        private Long responseTimeMs;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ScanIngredient { private String name; private String commonName; private String amount; private String unit; }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ScanAllergenAlert { private String allergen; private String severity; private String message; }

    // ========== Health Shield ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class HealthShieldResponse {
        private String currentMonth;
        private Integer overallPreparedness;
        private List<ThreatAlert> threats;
        private List<ProductDTO.ProductResponse> recommendedProducts;
        private List<MonthThreatSummary> timeline;
        private Long responseTimeMs;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ThreatAlert {
        private String name; private String severity; private String description;
        private String month; private Integer monthOffset;
        private List<String> productTags; private List<String> riskFactors; private Integer personalRiskScore;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthThreatSummary { private String month; private Integer threatCount; private String maxSeverity; private Boolean isCurrent; }

    // ========== Health Challenges ==========
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class HealthChallenge {
        private Long id; private String title; private String description; private String healthGoal;
        private Integer durationDays; private String difficulty; private String gradient; private String icon;
        private Integer participantCount; private Integer rewardPoints;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChallengeParticipation {
        private Long challengeId; private Long userId; private java.time.LocalDateTime joinedAt;
        private Integer currentDay; private Integer totalPoints; private Integer completedTasks; private Integer streak;
        private String currentDailyTask; private List<String> dailyTasks; private Boolean challengeCompleted;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LeaderboardEntry { private Long userId; private Integer points; private Integer streak; private Integer completedTasks; }

    // ========== Health Literacy Hub ==========
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LessonTopic { private String id; private String title; private String description; private String category; private String defaultLevel; }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LessonResponse {
        private String topicId; private String title; private String level; private String category;
        private String introduction; private List<LessonSection> sections; private List<String> keyTakeaways;
        private List<QuizQuestion> quiz; private List<String> relatedProductTypes; private Long responseTimeMs;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LessonSection { private String heading; private String content; }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuizQuestion { private String question; private List<String> options; private Integer correctIndex; private String explanation; }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuizSubmitRequest { private String topicId; private List<Integer> answers; }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuizResultResponse { private String topicId; private Integer totalQuestions; private String message; }
}
