package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.model.Product;
import com.healthshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Smart Product Comparison Engine
 * Compares 2-4 products across multiple AI-scored dimensions and provides a
 * recommendation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductComparisonEngine {

    private final ProductRepository productRepository;

    public AIDTO.ComparisonResponse compareProducts(List<Long> productIds) {
        log.info("Comparing products: {}", productIds);

        List<Product> products = productIds.stream()
                .map(id -> productRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (products.size() < 2) {
            throw new RuntimeException("Need at least 2 valid products to compare");
        }

        List<AIDTO.ComparisonProduct> compProducts = new ArrayList<>();
        Map<Long, Double> totalScores = new HashMap<>();

        for (Product p : products) {
            Map<String, String> scores = new HashMap<>();
            double totalScore = 0;

            // Value for Money
            double valueScore = computeValueScore(p, products);
            scores.put("Value for Money", scoreLabel(valueScore));
            totalScore += valueScore;

            // Ingredient Quality
            double ingredientScore = computeIngredientScore(p);
            scores.put("Ingredient Quality", scoreLabel(ingredientScore));
            totalScore += ingredientScore;

            // User Satisfaction
            double satisfactionScore = computeSatisfactionScore(p);
            scores.put("User Satisfaction", scoreLabel(satisfactionScore));
            totalScore += satisfactionScore;

            // Health Goal Match
            double goalScore = computeGoalMatchScore(p);
            scores.put("Health Goal Match", scoreLabel(goalScore));
            totalScore += goalScore;

            // Brand Reputation
            double brandScore = computeBrandScore(p);
            scores.put("Brand Reputation", scoreLabel(brandScore));
            totalScore += brandScore;

            // Dosage Adequacy
            double dosageScore = computeDosageScore(p);
            scores.put("Dosage Adequacy", scoreLabel(dosageScore));
            totalScore += dosageScore;

            totalScores.put(p.getId(), totalScore);

            compProducts.add(AIDTO.ComparisonProduct.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .brand(p.getBrand())
                    .price(p.getPrice())
                    .discountPrice(p.getDiscountPrice())
                    .rating(p.getAverageRating())
                    .reviewCount(p.getReviewCount())
                    .imageUrl(p.getImageUrl())
                    .healthGoals(p.getHealthGoals() != null ? Arrays.asList(p.getHealthGoals().split(",")) : List.of())
                    .dietaryInfo(p.getDietaryInfo())
                    .dosage(p.getDosage())
                    .ingredients(p.getIngredients())
                    .scores(scores)
                    .build());
        }

        // AI recommendation: product with highest total score
        Long bestId = totalScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(products.get(0).getId());

        Product bestProduct = products.stream()
                .filter(p -> p.getId().equals(bestId)).findFirst().orElse(products.get(0));

        String reason = generateRecommendationReason(bestProduct, totalScores);

        List<AIDTO.ComparisonDimension> dimensionDescriptions = List.of(
                AIDTO.ComparisonDimension.builder().name("Value for Money")
                        .description("Price relative to ingredients, dosage, and servings").build(),
                AIDTO.ComparisonDimension.builder().name("Ingredient Quality")
                        .description("Number and quality of active ingredients").build(),
                AIDTO.ComparisonDimension.builder().name("User Satisfaction")
                        .description("Average rating and review volume from customers").build(),
                AIDTO.ComparisonDimension.builder().name("Health Goal Match")
                        .description("Breadth of health goals the product addresses").build(),
                AIDTO.ComparisonDimension.builder().name("Brand Reputation")
                        .description("Brand recognition and product popularity").build(),
                AIDTO.ComparisonDimension.builder().name("Dosage Adequacy")
                        .description("Whether the product provides clear dosage instructions").build());

        return AIDTO.ComparisonResponse.builder()
                .products(compProducts)
                .aiRecommendedId(bestId)
                .aiRecommendationReason(reason)
                .dimensions(dimensionDescriptions)
                .build();
    }

    private double computeValueScore(Product p, List<Product> all) {
        double effectivePrice = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
        double maxPrice = all.stream()
                .mapToDouble(pr -> pr.getDiscountPrice() != null ? pr.getDiscountPrice() : pr.getPrice())
                .max().orElse(effectivePrice);
        if (maxPrice == 0)
            return 50;
        // Lower price = higher value score
        return Math.min(100, (1 - (effectivePrice / (maxPrice * 1.2))) * 100);
    }

    private double computeIngredientScore(Product p) {
        if (p.getIngredients() == null || p.getIngredients().isEmpty())
            return 30;
        // More ingredients typically (but not always) indicates a more comprehensive
        // formula
        int ingredientCount = p.getIngredients().split(",").length;
        return Math.min(100, 30 + ingredientCount * 8);
    }

    private double computeSatisfactionScore(Product p) {
        double ratingScore = (p.getAverageRating() != null ? p.getAverageRating() : 0) * 15; // 0-75
        double reviewBonus = Math.min(25, (p.getReviewCount() != null ? p.getReviewCount() : 0) * 2.5); // 0-25
        return Math.min(100, ratingScore + reviewBonus);
    }

    private double computeGoalMatchScore(Product p) {
        if (p.getHealthGoals() == null || p.getHealthGoals().isEmpty())
            return 20;
        int goalCount = p.getHealthGoals().split(",").length;
        return Math.min(100, 20 + goalCount * 20);
    }

    private double computeBrandScore(Product p) {
        double base = 40;
        if (p.getPurchaseCount() != null && p.getPurchaseCount() > 50)
            base += 30;
        else if (p.getPurchaseCount() != null && p.getPurchaseCount() > 20)
            base += 20;
        else if (p.getPurchaseCount() != null && p.getPurchaseCount() > 5)
            base += 10;
        if (p.getBrand() != null && !p.getBrand().isEmpty())
            base += 20;
        return Math.min(100, base);
    }

    private double computeDosageScore(Product p) {
        if (p.getDosage() == null || p.getDosage().isEmpty())
            return 25;
        if (p.getDosage().length() > 20)
            return 85; // detailed dosage
        return 60;
    }

    private String scoreLabel(double score) {
        if (score >= 85)
            return "Excellent";
        if (score >= 70)
            return "Very Good";
        if (score >= 55)
            return "Good";
        if (score >= 40)
            return "Average";
        return "Below Average";
    }

    private String generateRecommendationReason(Product best, Map<Long, Double> scores) {
        StringBuilder reason = new StringBuilder();
        reason.append(best.getName()).append(" scores highest overall");
        if (best.getAverageRating() != null && best.getAverageRating() >= 4.0) {
            reason.append(String.format(" with a %.1f★ rating", best.getAverageRating()));
        }
        if (best.getDiscountPrice() != null) {
            reason.append(", is currently discounted");
        }
        reason.append(". It offers the best combination of value, quality, and user satisfaction.");
        return reason.toString();
    }
}
