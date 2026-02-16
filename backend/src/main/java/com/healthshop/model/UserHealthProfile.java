package com.healthshop.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_health_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserHealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Integer age;

    private String gender;

    private Double height; // cm
    private Double weight; // kg

    // Health goals stored as JSON array string: ["Weight Loss", "Immunity"]
    @Column(columnDefinition = "TEXT")
    private String healthGoals;

    // Allergies: ["Gluten", "Dairy"]
    @Column(columnDefinition = "TEXT")
    private String allergies;

    // Dietary preferences: ["Vegan", "Keto"]
    @Column(columnDefinition = "TEXT")
    private String dietaryPreferences;

    // Medical conditions: ["Diabetes", "Hypertension"]
    @Column(columnDefinition = "TEXT")
    private String medicalConditions;

    @Enumerated(EnumType.STRING)
    private AgeGroup ageGroup;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum AgeGroup {
        TEEN, YOUNG_ADULT, ADULT, MIDDLE_AGED, SENIOR
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
