package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.dto.ProductDTO;
import com.healthshop.model.*;
import com.healthshop.repository.*;
import com.healthshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Health Score Calculator
 * Computes a composite health score based on user profile, purchase history,
 * and health goals.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class HealthScoreCalculator {

    private final UserHealthProfileRepository healthProfileRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    // ========== NUTRIENT IMPORTANCE BY GOAL ==========
    private static final Map<String, List<String>> GOAL_NUTRIENTS = new LinkedHashMap<>();
    static {
        GOAL_NUTRIENTS.put("Heart Health", List.of("Omega-3", "CoQ10", "Magnesium", "Fiber", "Garlic"));
        GOAL_NUTRIENTS.put("Immunity", List.of("Vitamin C", "Zinc", "Vitamin D", "Elderberry", "Echinacea"));
        GOAL_NUTRIENTS.put("Fitness", List.of("Protein", "Creatine", "BCAAs", "Pre-Workout", "Electrolytes"));
        GOAL_NUTRIENTS.put("Brain Health", List.of("Omega-3", "Ginkgo", "Bacopa", "B12", "Lion's Mane"));
        GOAL_NUTRIENTS.put("Bone Health", List.of("Calcium", "Vitamin D", "Vitamin K2", "Magnesium", "Collagen"));
        GOAL_NUTRIENTS.put("Weight Loss", List.of("Green Tea", "CLA", "Garcinia", "Fiber", "Protein"));
        GOAL_NUTRIENTS.put("Energy", List.of("B12", "Iron", "CoQ10", "Ashwagandha", "Rhodiola"));
        GOAL_NUTRIENTS.put("Sleep", List.of("Melatonin", "Magnesium", "Valerian", "L-Theanine", "Chamomile"));
        GOAL_NUTRIENTS.put("Skin Health", List.of("Collagen", "Vitamin E", "Biotin", "Vitamin C", "Hyaluronic"));
        GOAL_NUTRIENTS.put("Hair Health", List.of("Biotin", "Iron", "Zinc", "Keratin", "Folic Acid"));
        GOAL_NUTRIENTS.put("Digestive Health",
                List.of("Probiotic", "Fiber", "Digestive Enzyme", "Prebiotics", "Glutamine"));
        GOAL_NUTRIENTS.put("Joint Health", List.of("Glucosamine", "Turmeric", "Omega-3", "MSM", "Collagen"));
        GOAL_NUTRIENTS.put("Diabetes Care", List.of("Chromium", "Berberine", "Cinnamon", "Alpha Lipoic", "Fiber"));
        GOAL_NUTRIENTS.put("Eye Health", List.of("Lutein", "Zeaxanthin", "Vitamin A", "Omega-3", "Bilberry"));
        GOAL_NUTRIENTS.put("Stress Relief", List.of("Ashwagandha", "Magnesium", "L-Theanine", "Rhodiola", "Lavender"));
    }

    public AIDTO.HealthScoreResponse calculateHealthScore(Long userId) {
        log.info("Calculating health score for user: {}", userId);

        Optional<UserHealthProfile> profileOpt = healthProfileRepository.findByUserId(userId);
        List<Long> purchasedProductIds = orderRepository.findProductIdsPurchasedByUser(userId);

        // Dimension scores
        int profileCompleteness = calculateProfileCompleteness(profileOpt.orElse(null));
        int goalAlignment = calculateGoalAlignment(profileOpt.orElse(null), purchasedProductIds);
        int nutritionCoverage = calculateNutritionCoverage(profileOpt.orElse(null), purchasedProductIds);
        int consistencyScore = calculateConsistencyScore(userId);
        int diversityScore = calculateDiversityScore(purchasedProductIds);

        List<AIDTO.ScoreDimension> dimensions = List.of(
                buildDimension("Profile Completeness", profileCompleteness,
                        "How complete your health profile is for better AI recommendations"),
                buildDimension("Goal Alignment", goalAlignment,
                        "How well your purchases align with your health goals"),
                buildDimension("Nutrition Coverage", nutritionCoverage,
                        "How well your supplements cover nutritional needs"),
                buildDimension("Purchase Consistency", consistencyScore,
                        "How regularly you maintain your health supplement routine"),
                buildDimension("Product Diversity", diversityScore,
                        "Variety of health categories in your purchases"));

        int overall = (int) dimensions.stream().mapToInt(AIDTO.ScoreDimension::getScore).average().orElse(0);
        String grade = computeGrade(overall);

        // Generate improvement suggestions
        List<String> improvements = generateImprovements(dimensions, profileOpt.orElse(null));

        // Recommended products to improve score
        List<ProductDTO.ProductResponse> recommended = getScoreImprovementProducts(profileOpt.orElse(null),
                purchasedProductIds);

        return AIDTO.HealthScoreResponse.builder()
                .overallScore(overall)
                .grade(grade)
                .summary(generateSummary(overall, grade))
                .dimensions(dimensions)
                .improvements(improvements)
                .recommendedProducts(recommended)
                .build();
    }

    private int calculateProfileCompleteness(UserHealthProfile profile) {
        if (profile == null)
            return 10;
        int score = 10; // base for having a profile
        if (profile.getAge() != null)
            score += 15;
        if (profile.getGender() != null && !profile.getGender().isEmpty())
            score += 10;
        if (profile.getHeight() != null)
            score += 10;
        if (profile.getWeight() != null)
            score += 10;
        if (profile.getHealthGoals() != null && !profile.getHealthGoals().isEmpty())
            score += 20;
        if (profile.getAllergies() != null && !profile.getAllergies().isEmpty())
            score += 10;
        if (profile.getDietaryPreferences() != null && !profile.getDietaryPreferences().isEmpty())
            score += 10;
        if (profile.getMedicalConditions() != null && !profile.getMedicalConditions().isEmpty())
            score += 5;
        return Math.min(100, score);
    }

    private int calculateGoalAlignment(UserHealthProfile profile, List<Long> purchasedIds) {
        if (profile == null || profile.getHealthGoals() == null || purchasedIds.isEmpty())
            return 45;

        String[] goals = profile.getHealthGoals().split(",");
        int aligned = 0;
        int total = 0;

        for (Long pid : purchasedIds) {
            Optional<Product> prod = productRepository.findById(pid);
            if (prod.isPresent() && prod.get().getHealthGoals() != null) {
                total++;
                for (String goal : goals) {
                    if (prod.get().getHealthGoals().toLowerCase().contains(goal.trim().toLowerCase())) {
                        aligned++;
                        break;
                    }
                }
            }
        }
        if (total == 0)
            return 50;
        return Math.min(100, (int) ((aligned / (double) total) * 100));
    }

    private int calculateNutritionCoverage(UserHealthProfile profile, List<Long> purchasedIds) {
        if (profile == null || profile.getHealthGoals() == null)
            return 45;

        String[] goals = profile.getHealthGoals().split(",");
        Set<String> neededNutrients = new HashSet<>();
        for (String goal : goals) {
            List<String> nutrients = GOAL_NUTRIENTS.get(goal.trim());
            if (nutrients != null)
                neededNutrients.addAll(nutrients);
        }
        if (neededNutrients.isEmpty())
            return 50;

        Set<String> coveredNutrients = new HashSet<>();
        for (Long pid : purchasedIds) {
            Optional<Product> prod = productRepository.findById(pid);
            prod.ifPresent(p -> {
                String searchable = ((p.getName() != null ? p.getName() : "") + " " +
                        (p.getIngredients() != null ? p.getIngredients() : "") + " " +
                        (p.getTags() != null ? p.getTags() : "")).toLowerCase();
                for (String nutrient : neededNutrients) {
                    if (searchable.contains(nutrient.toLowerCase())) {
                        coveredNutrients.add(nutrient);
                    }
                }
            });
        }

        return Math.min(100, (int) ((coveredNutrients.size() / (double) neededNutrients.size()) * 100));
    }

    private int calculateConsistencyScore(Long userId) {
        List<Long> purchasedIds = orderRepository.findProductIdsPurchasedByUser(userId);
        if (purchasedIds.isEmpty())
            return 60; // demo: moderate consistency
        if (purchasedIds.size() >= 10)
            return 95;
        if (purchasedIds.size() >= 5)
            return 80;
        if (purchasedIds.size() >= 3)
            return 65;
        return 45;
    }

    private int calculateDiversityScore(List<Long> purchasedIds) {
        if (purchasedIds.isEmpty())
            return 55; // demo: moderate diversity
        Set<Long> categories = new HashSet<>();
        for (Long pid : purchasedIds) {
            productRepository.findById(pid).ifPresent(p -> {
                if (p.getCategory() != null)
                    categories.add(p.getCategory().getId());
            });
        }
        if (categories.size() >= 5)
            return 95;
        if (categories.size() >= 4)
            return 80;
        if (categories.size() >= 3)
            return 65;
        if (categories.size() >= 2)
            return 55;
        return 40;
    }

    private AIDTO.ScoreDimension buildDimension(String name, int score, String tip) {
        String status;
        if (score >= 80)
            status = "excellent";
        else if (score >= 60)
            status = "good";
        else if (score >= 40)
            status = "fair";
        else
            status = "poor";

        return AIDTO.ScoreDimension.builder()
                .name(name).score(score).status(status).tip(tip).build();
    }

    private String computeGrade(int score) {
        if (score >= 90)
            return "A+";
        if (score >= 80)
            return "A";
        if (score >= 70)
            return "B+";
        if (score >= 60)
            return "B";
        if (score >= 50)
            return "C";
        return "D";
    }

    private String generateSummary(int score, String grade) {
        if (score >= 80)
            return "Excellent! Your health supplement routine is well-optimized. Keep it up!";
        if (score >= 60)
            return "Good progress! A few adjustments could significantly improve your health coverage.";
        if (score >= 40)
            return "You're on the right track! Focus on completing your health profile and diversifying your supplement intake to boost your score.";
        return "Your wellness journey is just beginning! Complete your health profile, set your goals, and explore products aligned with your needs.";
    }

    private List<String> generateImprovements(List<AIDTO.ScoreDimension> dimensions, UserHealthProfile profile) {
        List<String> improvements = new ArrayList<>();
        for (AIDTO.ScoreDimension dim : dimensions) {
            if (dim.getScore() < 60) {
                switch (dim.getName()) {
                    case "Profile Completeness" ->
                        improvements.add(
                                "Complete your health profile with age, weight, goals, and allergies for better AI recommendations");
                    case "Goal Alignment" ->
                        improvements.add(
                                "Purchase products that match your stated health goals for a more targeted supplement routine");
                    case "Nutrition Coverage" ->
                        improvements.add(
                                "You have gaps in your nutritional supplementation — explore products that cover missing nutrients");
                    case "Purchase Consistency" ->
                        improvements.add("Build a regular supplement routine by reordering consistently");
                    case "Product Diversity" ->
                        improvements.add("Diversify across more health categories for holistic wellness");
                }
            }
        }
        if (profile == null) {
            improvements.add(0, "🚀 Create your health profile to unlock personalized AI recommendations");
        }
        return improvements;
    }

    private List<ProductDTO.ProductResponse> getScoreImprovementProducts(UserHealthProfile profile,
            List<Long> purchasedIds) {
        if (profile == null || profile.getHealthGoals() == null) {
            return productService.getFeaturedProducts().stream().limit(6).collect(Collectors.toList());
        }

        String[] goals = profile.getHealthGoals().split(",");
        Set<Long> purchasedSet = new HashSet<>(purchasedIds);
        List<ProductDTO.ProductResponse> results = new ArrayList<>();

        for (String goal : goals) {
            List<Product> products = productRepository.findByHealthGoal(goal.trim());
            for (Product p : products) {
                if (!purchasedSet.contains(p.getId()) && results.size() < 8) {
                    results.add(productService.toResponse(p));
                }
            }
        }
        return results;
    }
}
