package com.healthshop.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        private String shippingName;
        private String shippingAddress;
        private String shippingCity;
        private String shippingState;
        private String shippingZip;
        private String shippingPhone;
        private String paymentMethod;
        private String couponCode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private Long id;
        private String orderNumber;
        private List<OrderItemResponse> items;
        private Double totalAmount;
        private Double discountAmount;
        private Double finalAmount;
        private String couponCode;
        private Double discountPercentage;
        private String status;
        private String paymentStatus;
        private String paymentMethod;
        private String shippingName;
        private String shippingAddress;
        private String shippingCity;
        private String shippingState;
        private String shippingZip;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRequest {
        private Long productId;
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private Double productPrice;
        private Double productDiscountPrice;
        private Integer quantity;
        private Double totalPrice;
    }
}
