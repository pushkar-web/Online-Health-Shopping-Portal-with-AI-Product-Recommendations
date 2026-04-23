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

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    Optional<Product> findBySlug(String slug);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.healthGoals LIKE %:goal%")
    List<Product> findByHealthGoal(@Param("goal") String goal);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.tags) LIKE LOWER(CONCAT('%', :tag, '%')) OR LOWER(p.healthGoals) LIKE LOWER(CONCAT('%', :tag, '%')) OR LOWER(p.name) LIKE LOWER(CONCAT('%', :tag, '%')) OR LOWER(p.ingredients) LIKE LOWER(CONCAT('%', :tag, '%')))")
    List<Product> findByTag(@Param("tag") String tag);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    List<Product> findByFeaturedTrueAndActiveTrue();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.purchaseCount DESC")
    List<Product> findTrendingProducts(Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.createdAt DESC")
    List<Product> findNewArrivals(Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :categoryId AND p.id != :productId ORDER BY p.purchaseCount DESC")
    List<Product> findRelatedProducts(@Param("categoryId") Long categoryId, @Param("productId") Long productId, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.suitableAgeGroups LIKE %:ageGroup% ORDER BY p.purchaseCount DESC")
    List<Product> findPopularByAgeGroup(@Param("ageGroup") String ageGroup, Pageable pageable);

    long countByCategoryId(Long categoryId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    List<Product> findTop20ByActiveOrderByPurchaseCountDesc(boolean active);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    List<Product> findTop20ByActiveOrderByAverageRatingDesc(boolean active);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    Page<Product> findAll(Pageable pageable);
}
