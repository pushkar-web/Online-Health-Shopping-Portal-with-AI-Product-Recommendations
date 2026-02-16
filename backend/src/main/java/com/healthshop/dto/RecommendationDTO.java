package com.healthshop.dto;

import lombok.*;
import java.util.List;

public class RecommendationDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendationResponse {
        private List<ProductDTO.ProductResponse> basedOnGoals;
        private List<ProductDTO.ProductResponse> frequentlyBoughtTogether;
        private List<ProductDTO.ProductResponse> customersAlsoBought;
        private List<ProductDTO.ProductResponse> popularInYourAgeGroup;
        private List<ProductDTO.ProductResponse> trending;
        private List<BundleDTO> bundledProducts; // AI-created bundles
        private List<ProductDTO.ProductResponse> seasonalRecommendations;
        private String seasonName; // e.g., "Winter Wellness"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BundleDTO {
        private String title;
        private String description;
        private List<ProductDTO.ProductResponse> products;
        private Double totalPrice;
        private Double discountedPrice;
        private Integer discountPercentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SymptomSearchRequest {
        private String symptomDescription;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SymptomSearchResponse {
        private String symptomDescription;
        private List<String> identifiedSymptoms;
        private List<String> suggestedCategories;
        private List<ProductDTO.ProductResponse> suggestedProducts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HealthProfileRequest {
        private Integer age;
        private String gender;
        private Double height;
        private Double weight;
        private List<String> healthGoals;
        private List<String> allergies;
        private List<String> dietaryPreferences;
        private List<String> medicalConditions;
        private String ageGroup;
    }
}
