package com.healthshop.repository;

import com.healthshop.model.ProductInteraction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductInteractionRepository extends MongoRepository<ProductInteraction, String> {
    List<ProductInteraction> findByUserId(Long userId);
    List<ProductInteraction> findByUserIdAndInteractionType(Long userId, String interactionType);
    List<ProductInteraction> findByProductId(Long productId);
    long countByProductIdAndInteractionType(Long productId, String interactionType);
}
