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

import java.util.List;
import java.util.Map;

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
    private final RAGAgent ragAgent;
    private final VoiceIntentService voiceIntentService;
    private final SupplementScanService supplementScanService;
    private final HealthShieldService healthShieldService;
    private final HealthLiteracyService healthLiteracyService;

    // ========== RAG AGENT ENDPOINTS ==========
    @PostMapping("/rag/chat")
    @Operation(summary = "RAG-powered AI health chat with Groq LLM and knowledge base retrieval")
    public ResponseEntity<AIDTO.RAGChatResponse> ragChat(
            @RequestBody AIDTO.RAGChatRequest request, Authentication auth) {
        Long userId = auth != null ? getUserIdSafe(auth) : null;
        List<Map<String, String>> history = request.getHistory() != null ? request.getHistory() : List.of();
        return ResponseEntity.ok(ragAgent.chat(request.getMessage(), userId, history));
    }

    @PostMapping("/rag/quick")
    @Operation(summary = "Quick RAG query without conversation history")
    public ResponseEntity<AIDTO.RAGChatResponse> ragQuick(@RequestBody AIDTO.RAGQuickQuery request) {
        return ResponseEntity.ok(ragAgent.quickQuery(request.getQuery()));
    }

    @PostMapping("/rag/recommend")
    @Operation(summary = "RAG-powered product recommendation for a specific health concern")
    public ResponseEntity<AIDTO.RAGChatResponse> ragRecommend(
            @RequestBody AIDTO.RAGRecommendRequest request, Authentication auth) {
        Long userId = auth != null ? getUserIdSafe(auth) : null;
        return ResponseEntity.ok(ragAgent.recommendProducts(request.getHealthConcern(), userId));
    }

    @PostMapping("/rag/educate")
    @Operation(summary = "RAG-powered health education on a topic")
    public ResponseEntity<AIDTO.RAGChatResponse> ragEducate(@RequestBody AIDTO.RAGEducationRequest request) {
        return ResponseEntity.ok(ragAgent.healthEducation(request.getTopic()));
    }

    @PostMapping("/rag/symptoms")
    @Operation(summary = "RAG + Groq LLM powered symptom analysis with severity, lifestyle tips, and product recommendations")
    public ResponseEntity<AIDTO.SymptomAnalysisResponse> ragSymptomAnalysis(
            @RequestBody AIDTO.SymptomAnalysisRequest request, Authentication auth) {
        Long userId = auth != null ? getUserIdSafe(auth) : null;
        List<Map<String, String>> history = request.getHistory() != null ? request.getHistory() : List.of();
        return ResponseEntity.ok(ragAgent.analyzeSymptoms(request.getSymptoms(), userId, history));
    }

    @GetMapping("/rag/stats")
    @Operation(summary = "Get RAG knowledge base statistics")
    public ResponseEntity<Map<String, Object>> ragStats() {
        return ResponseEntity.ok(ragAgent.getRAGStats());
    }

    // ========== ADMIN AI DASHBOARD ==========
    @GetMapping("/admin/stats")
    @Operation(summary = "Get system-wide AI statistics for admin dashboard")
    public ResponseEntity<AIDTO.AdminAIStatsResponse> getAdminStats(Authentication auth) {
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

    // ========== VOICE ASSISTANT ==========
    @PostMapping("/voice/intent")
    @Operation(summary = "Voice assistant — parse spoken text into structured action and execute")
    public ResponseEntity<AIDTO.VoiceIntentResponse> voiceIntent(
            @RequestBody AIDTO.VoiceIntentRequest request, Authentication auth) {
        Long userId = auth != null ? getUserIdSafe(auth) : null;
        return ResponseEntity.ok(voiceIntentService.processVoiceIntent(request.getTranscript(), userId));
    }

    // ========== SUPPLEMENT SCANNER ==========
    @PostMapping("/scan/analyze")
    @Operation(summary = "Analyze OCR text from supplement label — extract ingredients, check safety, find store matches")
    public ResponseEntity<AIDTO.ScanAnalysisResponse> scanAnalyze(@RequestBody AIDTO.ScanRequest request) {
        return ResponseEntity.ok(supplementScanService.analyzeScan(request.getOcrText(), request.getUserAllergies()));
    }

    // ========== HEALTH SHIELD ==========
    @GetMapping("/health-shield")
    @Operation(summary = "Predictive seasonal health shield — upcoming threats, risk scores, prevention bundles")
    public ResponseEntity<AIDTO.HealthShieldResponse> healthShield(Authentication auth) {
        Long userId = auth != null ? getUserIdSafe(auth) : null;
        return ResponseEntity.ok(healthShieldService.getPersonalizedShield(userId));
    }

    // ========== HEALTH LITERACY HUB ==========
    @GetMapping("/learn/topics")
    @Operation(summary = "Get all available health lesson topics")
    public ResponseEntity<List<AIDTO.LessonTopic>> getLearnTopics() {
        return ResponseEntity.ok(healthLiteracyService.getAllTopics());
    }

    @GetMapping("/learn/lesson/{topicId}")
    @Operation(summary = "Generate an AI lesson for a specific topic")
    public ResponseEntity<AIDTO.LessonResponse> getLesson(
            @PathVariable String topicId, @RequestParam(required = false) String level) {
        return ResponseEntity.ok(healthLiteracyService.generateLesson(topicId, level));
    }

    @PostMapping("/learn/quiz/submit")
    @Operation(summary = "Submit quiz answers and get results")
    public ResponseEntity<AIDTO.QuizResultResponse> submitQuiz(@RequestBody AIDTO.QuizSubmitRequest request) {
        return ResponseEntity.ok(healthLiteracyService.evaluateQuiz(request.getTopicId(), request.getAnswers()));
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
