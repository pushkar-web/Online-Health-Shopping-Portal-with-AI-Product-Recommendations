package com.healthshop.dto;

import lombok.*;
import java.util.List;

public class ProductDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductResponse {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private String ingredients;
        private String benefits;
        private Double price;
        private Double discountPrice;
        private Integer stock;
        private String brand;
        private String imageUrl;
        private List<String> images;
        private Long categoryId;
        private String categoryName;
        private List<String> tags;
        private List<String> healthGoals;
        private String suitableAgeGroups;
        private String dietaryInfo;
        private String allergenInfo;
        private String dosage;
        private Double averageRating;
        private Integer reviewCount;
        private Integer purchaseCount;
        private Boolean featured;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductFilterRequest {
        private String search;
        private Long categoryId;
        private String healthGoal;
        private String ageGroup;
        private String dietaryPreference;
        private Double minPrice;
        private Double maxPrice;
        private Double minRating;
        private String sortBy; // price, rating, popularity, newest
        private String sortDir; // asc, desc
        private Integer page;
        private Integer size;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductCreateRequest {
        private String name;
        private String description;
        private String ingredients;
        private String benefits;
        private Double price;
        private Double discountPrice;
        private Integer stock;
        private String brand;
        private String imageUrl;
        private Long categoryId;
        private String tags;
        private String healthGoals;
        private String suitableAgeGroups;
        private String dietaryInfo;
        private String allergenInfo;
        private String dosage;
        private Boolean featured;
    }
}
