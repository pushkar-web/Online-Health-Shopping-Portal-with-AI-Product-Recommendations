package com.healthshop.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

public class ReviewDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewRequest {
        @NotNull
        private Long productId;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer rating;

        private String title;
        private String comment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String userAvatar;
        private Long productId;
        private Integer rating;
        private String title;
        private String comment;
        private Boolean verified;
        private Integer helpfulCount;
        private LocalDateTime createdAt;
    }
}
