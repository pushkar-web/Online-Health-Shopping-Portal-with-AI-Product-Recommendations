package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.model.*;
import com.healthshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Personalized Dosage Calculator
 * Provides AI-calibrated dosage recommendations based on user profile + product
 * data.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DosageCalculator {

        private final ProductRepository productRepository;
        private final UserHealthProfileRepository healthProfileRepository;

        // ========== DOSAGE KNOWLEDGE BASE ==========
        private static final Map<String, DosageInfo> DOSAGE_DB = new LinkedHashMap<>();
        static {
                addDosageInfo("Vitamin C", "500-1000mg", "Morning", "Once or twice daily",
                                List.of("Take with food to reduce stomach upset",
                                                "Pair with iron for better absorption"),
                                List.of("Very high doses (>2000mg) may cause digestive discomfort"));
                addDosageInfo("Vitamin D", "1000-4000 IU", "Morning", "Once daily",
                                List.of("Take with a fatty meal for better absorption",
                                                "Get blood levels checked annually"),
                                List.of("Excessive intake can cause calcium buildup"));
                addDosageInfo("Omega-3", "1000-2000mg", "With meals", "Once or twice daily",
                                List.of("Choose a product with both EPA and DHA",
                                                "Store in refrigerator to prevent oxidation"),
                                List.of("May thin blood at high doses"));
                addDosageInfo("Magnesium", "200-400mg", "Evening", "Once daily",
                                List.of("Magnesium glycinate is best for sleep",
                                                "Magnesium citrate is best for constipation"),
                                List.of("Can cause loose stools at higher doses"));
                addDosageInfo("Iron", "18-27mg", "Empty stomach", "Once daily",
                                List.of("Take with Vitamin C for 3x absorption",
                                                "Avoid taking with calcium, tea, or coffee"),
                                List.of("Can cause nausea on empty stomach — take with food if needed"));
                addDosageInfo("Zinc", "15-30mg", "With food", "Once daily",
                                List.of("Zinc picolinate has best absorption", "Don't exceed 40mg daily long-term"),
                                List.of("Can cause nausea if taken without food", "Long-term use may deplete copper"));
                addDosageInfo("Probiotic", "10-50 billion CFU", "Morning", "Once daily",
                                List.of("Take on empty stomach or with light meal", "Look for multi-strain formulas"),
                                List.of("May cause mild bloating initially"));
                addDosageInfo("Melatonin", "0.5-5mg", "30 min before bed", "Once daily",
                                List.of("Start with lowest effective dose",
                                                "Use for short periods to reset sleep cycle"),
                                List.of("Can cause morning grogginess", "Not recommended for long-term daily use"));
                addDosageInfo("Ashwagandha", "300-600mg", "Morning or evening", "Once or twice daily",
                                List.of("KSM-66 extract is clinically studied", "Takes 2-4 weeks for full effect"),
                                List.of("May interact with thyroid medications"));
                addDosageInfo("Turmeric", "500-1000mg", "With meals", "Once or twice daily",
                                List.of("Look for products with piperine/black pepper extract",
                                                "Curcumin content matters more than total weight"),
                                List.of("May interact with blood thinners"));
                addDosageInfo("Collagen", "5-15g", "Any time", "Once daily",
                                List.of("Type I & III for skin; Type II for joints", "Hydrolyzed peptides absorb best"),
                                List.of("Generally very safe with few side effects"));
                addDosageInfo("B12", "500-1000mcg", "Morning", "Once daily",
                                List.of("Methylcobalamin is the active form", "Sublingual tablets may absorb better"),
                                List.of("Very safe — excess is excreted in urine"));
                addDosageInfo("Biotin", "2500-5000mcg", "Any time", "Once daily",
                                List.of("Give it 3-6 months for hair/nail results",
                                                "Can interfere with lab tests — stop 72h before blood work"),
                                List.of("May cause breakouts in acne-prone individuals"));
                addDosageInfo("CoQ10", "100-200mg", "With meals", "Once daily",
                                List.of("Ubiquinol form absorbs better than ubiquinone", "Take with fatty food"),
                                List.of("May lower blood pressure slightly"));
                addDosageInfo("Glucosamine", "1500mg", "With food", "Once daily or split",
                                List.of("Pair with chondroitin for joint support",
                                                "Allow 6-8 weeks for noticeable results"),
                                List.of("Derived from shellfish — caution if allergic"));
                addDosageInfo("Calcium", "500-600mg per dose", "With meals", "Twice daily",
                                List.of("Body absorbs max ~500mg at once — split doses",
                                                "Calcium citrate can be taken without food"),
                                List.of("Don't take with iron supplements at the same time"));
        }

        public AIDTO.DosageResponse calculateDosage(Long productId, Long userId) {
                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new RuntimeException("Product not found"));

                Optional<UserHealthProfile> profileOpt = userId != null ? healthProfileRepository.findByUserId(userId)
                                : Optional.empty();

                // Search product data for matching supplement in our knowledge base
                String searchable = buildSearchString(product);
                DosageInfo matched = null;
                String matchedName = null;

                for (Map.Entry<String, DosageInfo> entry : DOSAGE_DB.entrySet()) {
                        if (searchable.contains(entry.getKey().toLowerCase())) {
                                matched = entry.getValue();
                                matchedName = entry.getKey();
                                break;
                        }
                }

                // Build response
                AIDTO.DosageResponse.DosageResponseBuilder builder = AIDTO.DosageResponse.builder()
                                .productName(product.getName());

                if (matched != null) {
                        builder.recommendedDosage(matched.dosage)
                                        .timing(matched.timing)
                                        .frequency(matched.frequency)
                                        .tips(matched.tips)
                                        .warnings(matched.warnings);
                } else {
                        // Use product's own dosage data
                        builder.recommendedDosage(
                                        product.getDosage() != null ? product.getDosage() : "Follow label instructions")
                                        .timing("As directed")
                                        .frequency("As directed on label")
                                        .tips(List.of("Always follow the manufacturer's recommended dosage",
                                                        "Consult a healthcare provider for personalized advice",
                                                        "Take with water unless directed otherwise"))
                                        .warnings(List.of(
                                                        "Do not exceed recommended dose without medical supervision"));
                }

                // Personalized note based on user profile
                if (profileOpt.isPresent()) {
                        String note = generatePersonalizedNote(profileOpt.get(), matchedName, product);
                        builder.personalizedNote(note);
                } else {
                        builder.personalizedNote(
                                        "Complete your health profile for personalized dosage adjustments based on your age, weight, and health conditions.");
                }

                return builder.build();
        }

        private String generatePersonalizedNote(UserHealthProfile profile, String nutrient, Product product) {
                List<String> notes = new ArrayList<>();

                // Age-based adjustments
                if (profile.getAge() != null) {
                        if (profile.getAge() >= 65) {
                                notes.add("As a senior, you may benefit from higher Vitamin D and Calcium intake. Start with the lower end of the dosage range and increase gradually.");
                        } else if (profile.getAge() < 25) {
                                notes.add("For younger adults, the standard recommended dose is typically sufficient.");
                        }
                }

                // Weight-based adjustment hint
                if (profile.getWeight() != null && profile.getWeight() > 90) {
                        notes.add("At your body weight, you may need the higher end of the dosage range for optimal effect.");
                }

                // Medical conditions
                if (profile.getMedicalConditions() != null) {
                        String conditions = profile.getMedicalConditions().toLowerCase();
                        if (conditions.contains("diabetes")) {
                                notes.add("With diabetes, monitor blood sugar closely when starting new supplements.");
                        }
                        if (conditions.contains("hypertension") || conditions.contains("blood pressure")) {
                                notes.add("Monitor blood pressure when adding new supplements to your routine.");
                        }
                }

                // Allergies
                if (profile.getAllergies() != null && !profile.getAllergies().isEmpty() &&
                                product.getAllergenInfo() != null) {
                        notes.add("⚠️ Check the allergen label carefully — you have listed allergies: "
                                        + profile.getAllergies());
                }

                if (notes.isEmpty()) {
                        return "Based on your profile, the standard recommended dosage should work well for you. Monitor how you feel and adjust timing if needed.";
                }
                return String.join(" ", notes);
        }

        private String buildSearchString(Product p) {
                return ((p.getName() != null ? p.getName() : "") + " " +
                                (p.getIngredients() != null ? p.getIngredients() : "") + " " +
                                (p.getTags() != null ? p.getTags() : "")).toLowerCase();
        }

        // ===== Helper =====
        private static class DosageInfo {
                String dosage;
                String timing;
                String frequency;
                List<String> tips;
                List<String> warnings;
        }

        private static void addDosageInfo(String name, String dosage, String timing, String freq,
                        List<String> tips, List<String> warnings) {
                DosageInfo info = new DosageInfo();
                info.dosage = dosage;
                info.timing = timing;
                info.frequency = freq;
                info.tips = tips;
                info.warnings = warnings;
                DOSAGE_DB.put(name, info);
        }
}
