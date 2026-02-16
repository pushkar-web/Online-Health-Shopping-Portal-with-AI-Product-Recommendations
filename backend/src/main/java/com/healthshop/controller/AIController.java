package com.healthshop.controller;

import com.healthshop.ai.*;
import com.healthshop.dto.AIDTO;
import com.healthshop.model.User;
import com.healthshop.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "Advanced AI-powered health analysis and recommendations")
public class AIController {

    private final HealthScoreCalculator healthScoreCalculator;
    private final InteractionChecker interactionChecker;
    private final ProductComparisonEngine comparisonEngine;
    private final DosageCalculator dosageCalculator;
    private final PurchasePatternAnalyzer purchasePatternAnalyzer;
    private final HealthInsightsEngine healthInsightsEngine;
    private final RecommendationEngine recommendationEngine;
    private final UserRepository userRepository;
    private final com.healthshop.service.AIAdminService aiAdminService;

    // ========== ADMIN AI DASHBOARD ==========
    @GetMapping("/admin/stats")
    @Operation(summary = "Get system-wide AI statistics for admin dashboard")
    public ResponseEntity<AIDTO.AdminAIStatsResponse> getAdminStats(Authentication auth) {
        // In a real app, verify admin role here or via SecurityConfig
        return ResponseEntity.ok(aiAdminService.getAdminStats());
    }

    // ========== HEALTH SCORE ==========
    @GetMapping("/health-score")
    @Operation(summary = "Get AI-calculated health score based on profile and purchases")
    public ResponseEntity<AIDTO.HealthScoreResponse> getHealthScore(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(healthScoreCalculator.calculateHealthScore(userId));
    }

    // ========== DRUG INTERACTION CHECKER ==========
    @PostMapping("/interaction-check")
    @Operation(summary = "Check supplement/medication interactions")
    public ResponseEntity<AIDTO.InteractionCheckResponse> checkInteractions(
            @RequestBody AIDTO.InteractionCheckRequest request) {
        return ResponseEntity.ok(interactionChecker.checkInteractions(request));
    }

    // ========== SMART PRODUCT COMPARISON ==========
    @PostMapping("/compare")
    @Operation(summary = "AI-powered comparison of 2-4 products")
    public ResponseEntity<AIDTO.ComparisonResponse> compareProducts(
            @RequestBody AIDTO.ComparisonRequest request) {
        return ResponseEntity.ok(comparisonEngine.compareProducts(request.getProductIds()));
    }

    // ========== DOSAGE CALCULATOR ==========
    @GetMapping("/dosage/{productId}")
    @Operation(summary = "Get personalized dosage recommendations for a product")
    public ResponseEntity<AIDTO.DosageResponse> getDosage(
            @PathVariable Long productId, Authentication auth) {
        Long userId = auth != null ? getUserIdSafe(auth) : null;
        return ResponseEntity.ok(dosageCalculator.calculateDosage(productId, userId));
    }

    // ========== PURCHASE PATTERN ANALYSIS ==========
    @GetMapping("/purchase-insights")
    @Operation(summary = "AI analysis of your purchase patterns and reorder predictions")
    public ResponseEntity<AIDTO.PurchaseInsights> getPurchaseInsights(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(purchasePatternAnalyzer.analyzePurchasePattern(userId));
    }

    // ========== FULL HEALTH INSIGHTS DASHBOARD ==========
    @GetMapping("/health-insights")
    @Operation(summary = "Comprehensive AI health insights dashboard")
    public ResponseEntity<AIDTO.HealthInsightsResponse> getHealthInsights(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(healthInsightsEngine.getHealthInsights(userId));
    }

    // ========== NUTRITION GAP ANALYSIS ==========
    @GetMapping("/nutrition-gaps")
    @Operation(summary = "AI analysis of nutritional gaps based on your purchases and goals")
    public ResponseEntity<AIDTO.NutritionGapAnalysis> getNutritionGaps(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(healthInsightsEngine.analyzeNutritionGaps(userId));
    }

    // ========== DAILY HEALTH TIPS ==========
    @GetMapping("/daily-tips")
    @Operation(summary = "AI-personalized daily health tips")
    public ResponseEntity<?> getDailyTips(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(healthInsightsEngine.getDailyTips(userId));
    }

    // ========== ENHANCED AI CHAT ==========
    @PostMapping("/chat")
    @Operation(summary = "Enhanced AI health chat with severity assessment and lifestyle tips")
    public ResponseEntity<AIDTO.ChatResponse> enhancedChat(
            @RequestBody AIDTO.ChatRequest request, Authentication auth) {
        Long userId = auth != null ? getUserIdSafe(auth) : null;
        return ResponseEntity.ok(recommendationEngine.enhancedChat(request.getMessage(), userId));
    }

    private Long getUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private Long getUserIdSafe(Authentication auth) {
        try {
            return getUserId(auth);
        } catch (Exception e) {
            return null;
        }
    }
}
