package com.healthshop.repository;

import com.healthshop.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    @Query("SELECT oi.product.id FROM OrderItem oi WHERE oi.order.id IN " +
           "(SELECT oi2.order.id FROM OrderItem oi2 WHERE oi2.product.id = :productId) " +
           "AND oi.product.id != :productId GROUP BY oi.product.id ORDER BY COUNT(oi.product.id) DESC")
    List<Long> findFrequentlyBoughtTogetherProductIds(@Param("productId") Long productId);
}
