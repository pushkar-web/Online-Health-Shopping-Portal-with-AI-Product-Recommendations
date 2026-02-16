package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.dto.ProductDTO;
import com.healthshop.dto.RecommendationDTO;
import com.healthshop.model.*;
import com.healthshop.repository.*;
import com.healthshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RecommendationEngine {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserHealthProfileRepository healthProfileRepository;

    private final ProductService productService;

    // ========== SYMPTOM → PRODUCT MAPPING ==========
    private static final Map<String, List<String>> SYMPTOM_MAP = new LinkedHashMap<>();
    static {
        SYMPTOM_MAP.put("tired|fatigue|exhausted|low energy|weakness",
                List.of("Iron", "B12", "Vitamin D", "Ashwagandha", "CoQ10", "Energy"));
        SYMPTOM_MAP.put("cold|flu|sick|fever|infection",
                List.of("Vitamin C", "Zinc", "Elderberry", "Immunity", "Echinacea"));
        SYMPTOM_MAP.put("stress|anxiety|nervous|tension",
                List.of("Ashwagandha", "Magnesium", "L-Theanine", "Stress Relief", "Lavender"));
        SYMPTOM_MAP.put("insomnia|sleep|can't sleep|restless",
                List.of("Melatonin", "Magnesium", "Valerian", "Sleep Aid", "Chamomile"));
        SYMPTOM_MAP.put("joint|pain|inflammation|arthritis",
                List.of("Glucosamine", "Turmeric", "Omega-3", "Joint Support", "MSM"));
        SYMPTOM_MAP.put("digestion|bloating|stomach|gut|constipation",
                List.of("Probiotic", "Fiber", "Digestive Enzyme", "Prebiotics", "Gut Health"));
        SYMPTOM_MAP.put("skin|acne|dull|dry skin|aging",
                List.of("Collagen", "Vitamin E", "Biotin", "Hyaluronic", "Skin Care"));
        SYMPTOM_MAP.put("hair|hair loss|thin hair|brittle",
                List.of("Biotin", "Iron", "Zinc", "Hair Growth", "Keratin"));
        SYMPTOM_MAP.put("weight|overweight|fat|obesity",
                List.of("Green Tea", "Garcinia", "CLA", "Weight Loss", "Metabolism"));
        SYMPTOM_MAP.put("diabetes|blood sugar|glucose",
                List.of("Chromium", "Berberine", "Cinnamon", "Diabetic Care", "Blood Sugar"));
        SYMPTOM_MAP.put("heart|blood pressure|cholesterol|cardiac",
                List.of("Omega-3", "CoQ10", "Garlic", "Heart Health", "Fish Oil"));
        SYMPTOM_MAP.put("bone|osteoporosis|fracture|weak bones",
                List.of("Calcium", "Vitamin D", "Magnesium", "Bone Health", "Vitamin K2"));
        SYMPTOM_MAP.put("eye|vision|dry eyes|blurry",
                List.of("Lutein", "Zeaxanthin", "Vitamin A", "Eye Health", "Bilberry"));
        SYMPTOM_MAP.put("memory|focus|concentration|brain fog",
                List.of("Omega-3", "Ginkgo", "Bacopa", "Brain Health", "Nootropic"));
    }

    /**
     * Main recommendation API — generates personalized recommendations for a user
     */
    public RecommendationDTO.RecommendationResponse getRecommendations(Long userId) {
        log.info("Generating recommendations for user: {}", userId);

        List<ProductDTO.ProductResponse> goalBased = getGoalBasedRecommendations(userId);
        List<ProductDTO.ProductResponse> collaborative = getCollaborativeRecommendations(userId);
        List<ProductDTO.ProductResponse> trending = getTrendingRecommendations();
        List<ProductDTO.ProductResponse> ageGroupBased = getAgeGroupRecommendations(userId);

        RecommendationDTO.RecommendationResponse response = RecommendationDTO.RecommendationResponse.builder()
                .basedOnGoals(goalBased)
                .customersAlsoBought(collaborative)
                .trending(trending)
                .popularInYourAgeGroup(ageGroupBased)
                .frequentlyBoughtTogether(List.of()) // Set per-product
                .bundledProducts(getBundleRecommendations(userId))
                .seasonalRecommendations(getSeasonalRecommendations())
                .seasonName(getCurrentSeasonName())
                .build();

        System.out.println("ANTIGRAVITY DEBUG: User " + userId);
        System.out.println("ANTIGRAVITY DEBUG: Bundles size: "
                + ((response.getBundledProducts() != null) ? response.getBundledProducts().size() : "null"));
        System.out.println("ANTIGRAVITY DEBUG: Seasonal size: "
                + ((response.getSeasonalRecommendations() != null) ? response.getSeasonalRecommendations().size()
                        : "null"));

        return response;
    }

    /**
     * Content-based filtering: match products to user's health goals
     */
    public List<ProductDTO.ProductResponse> getGoalBasedRecommendations(Long userId) {
        Optional<UserHealthProfile> profileOpt = healthProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty() || profileOpt.get().getHealthGoals() == null) {
            return productService.getFeaturedProducts();
        }

        UserHealthProfile profile = profileOpt.get();
        String[] goals = profile.getHealthGoals().split(",");
        Set<Long> recommendedIds = new LinkedHashSet<>();
        List<ProductDTO.ProductResponse> results = new ArrayList<>();

        for (String goal : goals) {
            List<Product> products = productRepository.findByHealthGoal(goal.trim());
            for (Product p : products) {
                if (recommendedIds.add(p.getId())) {
                    // Filter out products containing user's allergens
                    if (!containsAllergen(p, profile.getAllergies())) {
                        results.add(productService.toResponse(p));
                    }
                }
                if (results.size() >= 12)
                    break;
            }
            if (results.size() >= 12)
                break;
        }

        return results;
    }

    /**
     * Collaborative filtering: find users with similar purchases, recommend what
     * they bought
     */
    public List<ProductDTO.ProductResponse> getCollaborativeRecommendations(Long userId) {
        List<Long> userProductIds = orderRepository.findProductIdsPurchasedByUser(userId);
        if (userProductIds.isEmpty()) {
            return productService.getTrendingProducts();
        }

        // Find users who bought similar products
        List<Long> similarUserIds = orderRepository.findUsersWithSimilarPurchases(userId, userProductIds);

        if (similarUserIds.isEmpty()) {
            return productService.getTrendingProducts();
        }

        // Find products those similar users bought that this user hasn't
        Set<Long> recommended = new LinkedHashSet<>();
        for (Long similarUserId : similarUserIds.subList(0, Math.min(5, similarUserIds.size()))) {
            List<Long> theirProducts = orderRepository.findProductIdsPurchasedByUser(similarUserId);
            for (Long pid : theirProducts) {
                if (!userProductIds.contains(pid)) {
                    recommended.add(pid);
                }
                if (recommended.size() >= 12)
                    break;
            }
            if (recommended.size() >= 12)
                break;
        }

        return recommended.stream()
                .map(id -> productRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(productService::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Frequently bought together for a specific product
     */
    public List<ProductDTO.ProductResponse> getFrequentlyBoughtTogether(Long productId) {
        List<Long> relatedIds = orderItemRepository.findFrequentlyBoughtTogetherProductIds(productId);
        return relatedIds.stream()
                .limit(6)
                .map(id -> productRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(productService::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Popular in user's age group
     */
    public List<ProductDTO.ProductResponse> getAgeGroupRecommendations(Long userId) {
        Optional<UserHealthProfile> profileOpt = healthProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty() || profileOpt.get().getAgeGroup() == null) {
            return productService.getTrendingProducts();
        }

        String ageGroup = profileOpt.get().getAgeGroup().name();
        return productRepository.findPopularByAgeGroup(ageGroup, PageRequest.of(0, 12))
                .stream()
                .map(productService::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Trending products (most purchased)
     */
    public List<ProductDTO.ProductResponse> getTrendingRecommendations() {
        return productService.getTrendingProducts();
    }

    // ========== SEVERITY ASSESSMENT ==========
    private static final Map<String, String> SEVERITY_KEYWORDS = new LinkedHashMap<>();
    static {
        SEVERITY_KEYWORDS.put("severe|unbearable|extreme|emergency|chest pain|breathing difficulty|bleeding",
                "consult-doctor");
        SEVERITY_KEYWORDS.put("persistent|chronic|recurring|worsening|weeks|months", "moderate");
    }

    // ========== FOLLOW-UP QUESTIONS ==========
    private static final Map<String, List<String>> FOLLOW_UP_MAP = new LinkedHashMap<>();
    static {
        FOLLOW_UP_MAP.put("tired|fatigue|exhausted", List.of(
                "How long have you been feeling tired?",
                "Do you also experience dizziness or shortness of breath?",
                "Have you had your iron or B12 levels checked recently?"));
        FOLLOW_UP_MAP.put("stress|anxiety|nervous", List.of(
                "Is the stress related to work, sleep, or general health?",
                "Do you also have trouble sleeping?",
                "Have you tried any relaxation techniques?"));
        FOLLOW_UP_MAP.put("joint|pain|inflammation", List.of(
                "Which joints are affected?",
                "Is the pain worse in the morning or after activity?",
                "Have you tried any anti-inflammatory supplements before?"));
        FOLLOW_UP_MAP.put("sleep|insomnia", List.of(
                "Do you have trouble falling asleep or staying asleep?",
                "What time do you typically go to bed?",
                "Do you consume caffeine after 2pm?"));
        FOLLOW_UP_MAP.put("digestion|bloating|stomach", List.of(
                "Is bloating related to specific foods?",
                "How is your fiber and water intake?",
                "Have you tried probiotics before?"));
    }

    // ========== LIFESTYLE TIPS ==========
    private static final Map<String, List<String>> LIFESTYLE_TIPS_MAP = new LinkedHashMap<>();
    static {
        LIFESTYLE_TIPS_MAP.put("tired|fatigue", List.of(
                "Aim for 7-9 hours of quality sleep each night",
                "Stay hydrated — dehydration is a common cause of fatigue",
                "Include iron-rich foods like spinach, lentils, and red meat in your diet",
                "Exercise regularly — even 20 minutes of walking can boost energy"));
        LIFESTYLE_TIPS_MAP.put("stress|anxiety", List.of(
                "Practice deep breathing exercises for 5-10 minutes daily",
                "Limit caffeine intake, especially after 2pm",
                "Try journaling or meditation to manage stress",
                "Ensure you're getting regular physical activity"));
        LIFESTYLE_TIPS_MAP.put("sleep|insomnia", List.of(
                "Maintain a consistent sleep schedule",
                "Avoid screens 1 hour before bedtime",
                "Keep your bedroom cool, dark, and quiet",
                "Avoid heavy meals close to bedtime"));
        LIFESTYLE_TIPS_MAP.put("joint|pain", List.of(
                "Gentle stretching and low-impact exercise can help",
                "Maintain a healthy weight to reduce joint stress",
                "Apply heat or cold therapy for acute pain",
                "Include anti-inflammatory foods like turmeric, ginger, and fatty fish"));
        LIFESTYLE_TIPS_MAP.put("digestion|bloating", List.of(
                "Eat slowly and chew food thoroughly",
                "Increase dietary fiber gradually to avoid gas",
                "Stay well-hydrated throughout the day",
                "Consider an elimination diet to identify trigger foods"));
    }

    /**
     * Enhanced Symptom-based search with NLP scoring, severity assessment,
     * follow-ups, and lifestyle tips
     */
    public RecommendationDTO.SymptomSearchResponse searchBySymptom(String symptomDescription) {
        String lowerSymptom = symptomDescription.toLowerCase();
        List<String> identifiedSymptoms = new ArrayList<>();
        Set<String> suggestedTags = new LinkedHashSet<>();

        // Score each symptom category by how many patterns match (NLP-like relevance
        // scoring)
        Map<String, Integer> categoryScores = new LinkedHashMap<>();
        for (Map.Entry<String, List<String>> entry : SYMPTOM_MAP.entrySet()) {
            String[] patterns = entry.getKey().split("\\|");
            int score = 0;
            for (String pattern : patterns) {
                if (lowerSymptom.contains(pattern.trim())) {
                    score++;
                    identifiedSymptoms.add(pattern.trim());
                }
            }
            if (score > 0) {
                categoryScores.put(entry.getKey(), score);
            }
        }

        // Sort by relevance score and add tags in order
        categoryScores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .forEach(entry -> suggestedTags.addAll(SYMPTOM_MAP.get(entry.getKey())));

        // If no symptoms matched, do a general search
        if (suggestedTags.isEmpty()) {
            suggestedTags.add(symptomDescription);
        }

        // Find products matching the suggested tags
        Set<Long> productIds = new LinkedHashSet<>();
        List<ProductDTO.ProductResponse> products = new ArrayList<>();
        for (String tag : suggestedTags) {
            List<Product> tagProducts = productRepository.findByTag(tag);
            for (Product p : tagProducts) {
                if (productIds.add(p.getId())) {
                    products.add(productService.toResponse(p));
                }
                if (products.size() >= 20)
                    break;
            }
            if (products.size() >= 20)
                break;
        }

        return RecommendationDTO.SymptomSearchResponse.builder()
                .symptomDescription(symptomDescription)
                .identifiedSymptoms(identifiedSymptoms)
                .suggestedCategories(new ArrayList<>(suggestedTags))
                .suggestedProducts(products)
                .build();
    }

    /**
     * Enhanced AI chat with severity assessment, follow-up questions, and lifestyle
     * tips
     */
    public AIDTO.ChatResponse enhancedChat(String message, Long userId) {
        String lowerMessage = message.toLowerCase();
        List<String> identifiedSymptoms = new ArrayList<>();
        Set<String> suggestedTags = new LinkedHashSet<>();

        // NLP-scored symptom matching
        Map<String, Integer> categoryScores = new LinkedHashMap<>();
        for (Map.Entry<String, List<String>> entry : SYMPTOM_MAP.entrySet()) {
            String[] patterns = entry.getKey().split("\\|");
            int score = 0;
            for (String pattern : patterns) {
                if (lowerMessage.contains(pattern.trim())) {
                    score++;
                    if (!identifiedSymptoms.contains(pattern.trim())) {
                        identifiedSymptoms.add(pattern.trim());
                    }
                }
            }
            if (score > 0)
                categoryScores.put(entry.getKey(), score);
        }

        categoryScores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .forEach(entry -> suggestedTags.addAll(SYMPTOM_MAP.get(entry.getKey())));

        if (suggestedTags.isEmpty())
            suggestedTags.add(message);

        // Products
        Set<Long> productIds = new LinkedHashSet<>();
        List<ProductDTO.ProductResponse> products = new ArrayList<>();
        for (String tag : suggestedTags) {
            List<Product> tagProducts = productRepository.findByTag(tag);
            for (Product p : tagProducts) {
                if (productIds.add(p.getId()))
                    products.add(productService.toResponse(p));
                if (products.size() >= 12)
                    break;
            }
            if (products.size() >= 12)
                break;
        }

        // Severity assessment
        String severity = "mild";
        for (Map.Entry<String, String> entry : SEVERITY_KEYWORDS.entrySet()) {
            for (String pattern : entry.getKey().split("\\|")) {
                if (lowerMessage.contains(pattern)) {
                    severity = entry.getValue();
                    break;
                }
            }
        }

        // Follow-up questions
        List<String> followUps = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : FOLLOW_UP_MAP.entrySet()) {
            for (String pattern : entry.getKey().split("\\|")) {
                if (lowerMessage.contains(pattern)) {
                    followUps.addAll(entry.getValue());
                    break;
                }
            }
        }
        if (followUps.isEmpty()) {
            followUps = List.of(
                    "Can you describe your symptoms in more detail?",
                    "How long have you been experiencing this?",
                    "Are you currently taking any medications?");
        }

        // Lifestyle tips
        List<String> lifestyleTips = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : LIFESTYLE_TIPS_MAP.entrySet()) {
            for (String pattern : entry.getKey().split("\\|")) {
                if (lowerMessage.contains(pattern)) {
                    lifestyleTips.addAll(entry.getValue());
                    break;
                }
            }
        }
        if (lifestyleTips.isEmpty()) {
            lifestyleTips = List.of("Stay hydrated and maintain a balanced diet",
                    "Regular exercise supports overall health",
                    "Consult a healthcare provider for persistent symptoms");
        }

        // Build AI response message
        String responseMessage = buildChatResponseMessage(identifiedSymptoms, severity, products.size());

        return AIDTO.ChatResponse.builder()
                .message(responseMessage)
                .identifiedSymptoms(identifiedSymptoms)
                .suggestedCategories(new ArrayList<>(suggestedTags))
                .suggestedProducts(products)
                .followUpQuestions(followUps.stream().distinct().limit(3).collect(Collectors.toList()))
                .severity(severity)
                .lifestyleTips(lifestyleTips.stream().distinct().limit(4).collect(Collectors.toList()))
                .build();
    }

    private String buildChatResponseMessage(List<String> symptoms, String severity, int productCount) {
        StringBuilder sb = new StringBuilder();
        if (symptoms.isEmpty()) {
            sb.append("I couldn't identify specific symptoms from your description. ");
            sb.append("Could you try describing how you feel or what health concerns you have?");
        } else {
            sb.append("Based on your description, I've identified symptoms related to: ");
            sb.append(String.join(", ", symptoms)).append(". ");

            if ("consult-doctor".equals(severity)) {
                sb.append("\n\n⚠️ **Important:** Your symptoms may require professional medical attention. ");
                sb.append(
                        "Please consult a healthcare provider. The products below are supplementary and not a substitute for medical care.");
            } else if ("moderate".equals(severity)) {
                sb.append(
                        "\nThese symptoms seem persistent. Consider consulting a healthcare provider if they don't improve.");
            }

            if (productCount > 0) {
                sb.append("\n\nI've found ").append(productCount)
                        .append(" products that may help support your health.");
            }
        }
        return sb.toString();
    }

    /**
     * Check if product contains any of the user's allergens
     */
    private boolean containsAllergen(Product product, String userAllergies) {
        if (userAllergies == null || product.getAllergenInfo() == null)
            return false;
        String[] allergies = userAllergies.toLowerCase().split(",");
        String productAllergens = product.getAllergenInfo().toLowerCase();
        for (String allergy : allergies) {
            if (productAllergens.contains(allergy.trim()))
                return true;
        }
        return false;
    }

    // ========== NEW AI FEATURES ==========

    /**
     * AI Bundles: Combine a main goal product with a complementary one
     */
    public List<RecommendationDTO.BundleDTO> getBundleRecommendations(Long userId) {
        List<ProductDTO.ProductResponse> personalRecs = getGoalBasedRecommendations(userId);
        if (personalRecs.isEmpty())
            return List.of();

        List<RecommendationDTO.BundleDTO> bundles = new ArrayList<>();

        // Strategy: Take top 2 recommendations and find complements
        // For simplicity in this MVP: Bundle the top recommendation with a trending
        // product that isn't the same
        if (!personalRecs.isEmpty()) {
            ProductDTO.ProductResponse main = personalRecs.get(0);
            List<ProductDTO.ProductResponse> trending = getTrendingRecommendations();

            Optional<ProductDTO.ProductResponse> complement = trending.stream()
                    .filter(p -> !p.getId().equals(main.getId()) && !p.getCategoryName().equals(main.getCategoryName()))
                    .findFirst();

            if (complement.isPresent()) {
                ProductDTO.ProductResponse comp = complement.get();
                double total = main.getPrice() + comp.getPrice();
                double discount = total * 0.85; // 15% off bundle

                bundles.add(RecommendationDTO.BundleDTO.builder()
                        .title("Power Pair: " + main.getName() + " + " + comp.getName())
                        .description(
                                "Complete your " + (main.getCategoryName() != null ? main.getCategoryName() : "health")
                                        + " regimen with this AI-curated set.")
                        .products(List.of(main, comp))
                        .totalPrice(total)
                        .discountedPrice(discount)
                        .discountPercentage(15)
                        .build());
            }
        }
        return bundles;
    }

    /**
     * Seasonal Recommendations based on current month
     */
    public List<ProductDTO.ProductResponse> getSeasonalRecommendations() {
        // Logic: Month-based.
        // Winter (Nov-Feb): Immunity
        // Spring (Mar-May): Allergies/Energy
        // Summer (Jun-Aug): Skin/Hydration
        // Autumn (Sep-Oct): Digestion/Sleep

        int month = java.time.LocalDate.now().getMonthValue();
        String searchTag;

        if (month >= 11 || month <= 2)
            searchTag = "Immunity";
        else if (month >= 3 && month <= 5)
            searchTag = "Energy";
        else if (month >= 6 && month <= 8)
            searchTag = "Skin";
        else
            searchTag = "Sleep";

        return productRepository.findByTag(searchTag).stream()
                .limit(4)
                .map(productService::toResponse)
                .collect(Collectors.toList());
    }

    public String getCurrentSeasonName() {
        int month = java.time.LocalDate.now().getMonthValue();
        if (month >= 11 || month <= 2)
            return "Winter Wellness ❄️";
        else if (month >= 3 && month <= 5)
            return "Spring Vitality 🌸";
        else if (month >= 6 && month <= 8)
            return "Summer Glow ☀️";
        else
            return "Autumn Balance 🍂";
    }
}
