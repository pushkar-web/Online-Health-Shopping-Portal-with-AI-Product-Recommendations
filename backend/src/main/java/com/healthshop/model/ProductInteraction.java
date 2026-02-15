package com.healthshop.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "product_interactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInteraction {

    @Id
    private String id;

    private Long userId;
    private Long productId;

    private String interactionType; // VIEW, CLICK, PURCHASE, WISHLIST, CART_ADD

    private String searchQuery;     // what the user searched for
    private String sessionId;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
