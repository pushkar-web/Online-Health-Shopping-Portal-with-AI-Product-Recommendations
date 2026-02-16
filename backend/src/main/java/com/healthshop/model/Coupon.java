package com.healthshop.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType; // PERCENTAGE, FIXED

    private Double discountValue;

    private Double minPurchaseAmount;

    private LocalDateTime expirationDate;

    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive = true;

    public enum DiscountType {
        PERCENTAGE, FIXED
    }
}
