package com.healthshop.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(nullable = false)
    private Double price;

    private Double discountPrice;

    @Builder.Default
    private Integer stock = 100;

    private String brand;

    private String imageUrl;

    // Additional images as JSON array
    @Column(columnDefinition = "TEXT")
    private String images;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    // Tags stored as comma-separated: "immunity,vitamin-c,antioxidant"
    @Column(columnDefinition = "TEXT")
    private String tags;

    // Health goals this product helps with: "Weight Loss,Immunity,Heart Health"
    @Column(columnDefinition = "TEXT")
    private String healthGoals;

    // Suitable age groups: "ADULT,SENIOR"
    private String suitableAgeGroups;

    // Dietary info: "Vegan,Gluten-Free"
    private String dietaryInfo;

    // Allergen warnings: "Contains Soy,Contains Dairy"
    @Column(columnDefinition = "TEXT")
    private String allergenInfo;

    private String dosage;

    @Builder.Default
    private Double averageRating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private Integer purchaseCount = 0;

    @Builder.Default
    private Integer viewCount = 0;

    @Builder.Default
    private Boolean featured = false;

    @Builder.Default
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    @JsonIgnore
    private List<Review> reviews = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        // Recalculate average rating
        if (reviews != null && !reviews.isEmpty()) {
            this.averageRating = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            this.reviewCount = reviews.size();
        }
    }
}
