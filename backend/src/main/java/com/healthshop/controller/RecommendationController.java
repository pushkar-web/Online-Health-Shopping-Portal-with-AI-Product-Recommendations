package com.healthshop.controller;

import com.healthshop.ai.RecommendationEngine;
import com.healthshop.dto.ProductDTO;
import com.healthshop.dto.RecommendationDTO;
import com.healthshop.model.User;
import com.healthshop.repository.UserRepository;
import com.healthshop.service.UserHealthProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Recommendations & Health", description = "AI recommendations and user health profiles")
public class RecommendationController {

    private final RecommendationEngine recommendationEngine;
    private final UserHealthProfileService healthProfileService;
    private final UserRepository userRepository;

    @GetMapping("/recommendations/{userId}")
    @Operation(summary = "Get AI-powered product recommendations for a user")
    public ResponseEntity<RecommendationDTO.RecommendationResponse> getRecommendations(
            @PathVariable Long userId) {
        return ResponseEntity.ok(recommendationEngine.getRecommendations(userId));
    }

    @GetMapping("/recommendations/product/{productId}/frequently-bought-together")
    @Operation(summary = "Get frequently bought together products")
    public ResponseEntity<List<ProductDTO.ProductResponse>> getFrequentlyBoughtTogether(
            @PathVariable Long productId) {
        return ResponseEntity.ok(recommendationEngine.getFrequentlyBoughtTogether(productId));
    }

    @PostMapping("/chat/symptoms")
    @Operation(summary = "Symptom-based product search (AI chatbot)")
    public ResponseEntity<RecommendationDTO.SymptomSearchResponse> searchBySymptom(
            @RequestBody RecommendationDTO.SymptomSearchRequest request) {
        return ResponseEntity.ok(recommendationEngine.searchBySymptom(request.getSymptomDescription()));
    }

    @GetMapping("/user/health-profile")
    @Operation(summary = "Get user's health profile")
    public ResponseEntity<RecommendationDTO.HealthProfileRequest> getHealthProfile(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(healthProfileService.getProfile(userId));
    }

    @PutMapping("/user/health-profile")
    @Operation(summary = "Update user's health profile")
    public ResponseEntity<RecommendationDTO.HealthProfileRequest> updateHealthProfile(
            Authentication auth, @RequestBody RecommendationDTO.HealthProfileRequest request) {
        System.out.println("ANTIGRAVITY DEBUG: Update Profile Request received");
        if (auth == null) {
            System.out.println("ANTIGRAVITY DEBUG: Auth is null");
            throw new RuntimeException("Authentication is null");
        }
        System.out.println("ANTIGRAVITY DEBUG: Auth name: " + auth.getName());
        Long userId = getUserId(auth);
        System.out.println("ANTIGRAVITY DEBUG: User ID: " + userId);
        return ResponseEntity.ok(healthProfileService.updateProfile(userId, request));
    }

    private Long getUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
