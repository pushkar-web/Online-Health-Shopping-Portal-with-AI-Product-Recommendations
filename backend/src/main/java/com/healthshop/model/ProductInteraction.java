package com.healthshop.model;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_interactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long productId;

    private String interactionType; // VIEW, CLICK, PURCHASE, WISHLIST, CART_ADD

    private String searchQuery;     // what the user searched for
    private String sessionId;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
