package com.healthshop.repository;

import com.healthshop.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);

    @org.springframework.data.jpa.repository.Query("SELECT c.name, COUNT(p.id) FROM Category c LEFT JOIN Product p ON p.category.id = c.id GROUP BY c.name")
    java.util.List<Object[]> getCategoryDistribution();
}
