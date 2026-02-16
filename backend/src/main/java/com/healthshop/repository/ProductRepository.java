package com.healthshop.repository;

import com.healthshop.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.healthGoals LIKE %:goal%")
    List<Product> findByHealthGoal(@Param("goal") String goal);

    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.tags) LIKE LOWER(CONCAT('%', :tag, '%')) OR LOWER(p.healthGoals) LIKE LOWER(CONCAT('%', :tag, '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', :tag, '%')) OR LOWER(p.ingredients) LIKE LOWER(CONCAT('%', :tag, '%')))")
    List<Product> findByTag(@Param("tag") String tag);

    List<Product> findByFeaturedTrueAndActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.purchaseCount DESC")
    List<Product> findTrendingProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.createdAt DESC")
    List<Product> findNewArrivals(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :categoryId AND p.id != :productId ORDER BY p.purchaseCount DESC")
    List<Product> findRelatedProducts(@Param("categoryId") Long categoryId, @Param("productId") Long productId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.suitableAgeGroups LIKE %:ageGroup% ORDER BY p.purchaseCount DESC")
    List<Product> findPopularByAgeGroup(@Param("ageGroup") String ageGroup, Pageable pageable);
}
