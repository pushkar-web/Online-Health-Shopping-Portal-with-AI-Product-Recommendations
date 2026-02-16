package com.healthshop.repository;

import com.healthshop.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT oi.product.id FROM OrderItem oi WHERE oi.order.user.id = :userId")
    List<Long> findProductIdsPurchasedByUser(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT o.user.id FROM Order o WHERE o.user.id != :userId AND EXISTS " +
           "(SELECT oi FROM OrderItem oi WHERE oi.order = o AND oi.product.id IN :productIds)")
    List<Long> findUsersWithSimilarPurchases(@Param("userId") Long userId, @Param("productIds") List<Long> productIds);
}
