package com.healthshop.repository;

import com.healthshop.model.ProductInteraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductInteractionRepository extends JpaRepository<ProductInteraction, Long> {
    
    List<ProductInteraction> findByUserIdOrderByTimestampDesc(Long userId);
    
    List<ProductInteraction> findByProductIdOrderByTimestampDesc(Long productId);
    
    Page<ProductInteraction> findByUserId(Long userId, Pageable pageable);
    
    Long countByProductIdAndInteractionType(Long productId, String interactionType);
}
