package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.model.Product;
import com.healthshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AI Drug/Supplement Interaction Checker
 * Checks for known interactions between supplements and medications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionChecker {

    private final ProductRepository productRepository;

    // ========== KNOWN INTERACTION DATABASE ==========
    private static final List<InteractionRule> INTERACTION_RULES = new ArrayList<>();

    static {
        // Critical interactions
        addRule("Vitamin K", "Warfarin", "critical",
                "Vitamin K can reduce the effectiveness of blood thinners like Warfarin",
                "Consult your doctor before combining. Maintain consistent Vitamin K intake.");
        addRule("St. John's Wort", "Antidepressant", "critical",
                "St. John's Wort can cause serotonin syndrome when combined with SSRIs/SNRIs",
                "Do NOT combine. Consult your psychiatrist immediately.");
        addRule("Ginkgo", "Blood Thinner", "critical",
                "Ginkgo Biloba has blood-thinning properties that amplify anticoagulant effects",
                "Avoid combination. Risk of excessive bleeding.");

        // Moderate interactions
        addRule("Calcium", "Iron", "moderate",
                "Calcium can inhibit iron absorption when taken together",
                "Take calcium and iron supplements at different times of day (at least 2 hours apart).");
        addRule("Zinc", "Copper", "moderate",
                "High-dose zinc can deplete copper levels over time",
                "If taking zinc long-term, add a small copper supplement (2mg per 30mg zinc).");
        addRule("Magnesium", "Antibiotics", "moderate",
                "Magnesium can reduce absorption of certain antibiotics (tetracyclines, fluoroquinolones)",
                "Take magnesium 2-3 hours before or after antibiotics.");
        addRule("Fish Oil", "Blood Thinner", "moderate",
                "Omega-3 fatty acids have mild blood-thinning effects",
                "Monitor for unusual bruising. Inform your doctor about fish oil use.");
        addRule("Vitamin E", "Blood Thinner", "moderate",
                "High-dose Vitamin E may increase bleeding risk with anticoagulants",
                "Limit Vitamin E to recommended dose. Consult doctor if on blood thinners.");
        addRule("Turmeric", "Blood Thinner", "moderate",
                "Curcumin in turmeric has anti-platelet properties",
                "Use caution if on anticoagulants. Consult your doctor.");
        addRule("Melatonin", "Blood Pressure Medication", "moderate",
                "Melatonin may affect blood pressure regulation",
                "Monitor blood pressure closely. Take melatonin at bedtime only.");

        // Mild interactions
        addRule("Vitamin C", "B12", "mild",
                "High-dose Vitamin C may slightly reduce B12 absorption",
                "Take at different times if using high-dose Vitamin C (>1000mg).");
        addRule("Green Tea", "Iron", "mild",
                "Tannins in green tea can reduce iron absorption",
                "Drink green tea between meals rather than with iron-rich foods or supplements.");
        addRule("Fiber", "Medication", "mild",
                "High fiber can slow absorption of various medications",
                "Take fiber supplements 1-2 hours away from medications.");

        // Beneficial combinations
        addBeneficial("Vitamin D", "Calcium", "Vitamin D enhances calcium absorption — great combination for bone health");
        addBeneficial("Vitamin C", "Iron", "Vitamin C significantly boosts iron absorption");
        addBeneficial("Vitamin D", "Magnesium", "Magnesium is required for Vitamin D activation in the body");
        addBeneficial("Turmeric", "Black Pepper", "Piperine in black pepper increases curcumin absorption by up to 2000%");
        addBeneficial("Probiotics", "Prebiotics", "Prebiotics feed probiotics for enhanced gut health (synbiotic effect)");
        addBeneficial("Omega-3", "Vitamin E", "Vitamin E helps prevent oxidation of omega-3 fatty acids");
        addBeneficial("CoQ10", "Omega-3", "Fat-soluble CoQ10 is better absorbed when taken with omega-3");
        addBeneficial("B12", "Folate", "B12 and folate work synergistically for red blood cell production");
        addBeneficial("Zinc", "Vitamin C", "Both support immune function through complementary pathways");
    }

    public AIDTO.InteractionCheckResponse checkInteractions(AIDTO.InteractionCheckRequest request) {
        log.info("Checking interactions for {} products and {} medications",
                request.getProductIds().size(),
                request.getCurrentMedications() != null ? request.getCurrentMedications().size() : 0);

        List<Product> products = new ArrayList<>();
        for (Long id : request.getProductIds()) {
            productRepository.findById(id).ifPresent(products::add);
        }

        List<String> medications = request.getCurrentMedications() != null ? request.getCurrentMedications() : List.of();

        List<AIDTO.InteractionWarning> warnings = new ArrayList<>();
        List<AIDTO.InteractionInfo> safeCombos = new ArrayList<>();

        // Check product-product interactions
        for (int i = 0; i < products.size(); i++) {
            for (int j = i + 1; j < products.size(); j++) {
                checkPairInteractions(products.get(i), products.get(j), warnings, safeCombos);
            }
        }

        // Check product-medication interactions
        for (Product product : products) {
            for (String medication : medications) {
                checkMedicationInteractions(product, medication, warnings);
            }
        }

        // Determine overall risk
        String overallRisk = "none";
        if (warnings.stream().anyMatch(w -> "critical".equals(w.getSeverity()))) overallRisk = "high";
        else if (warnings.stream().anyMatch(w -> "moderate".equals(w.getSeverity()))) overallRisk = "moderate";
        else if (!warnings.isEmpty()) overallRisk = "low";

        // General advice
        List<String> advice = generateAdvice(warnings, overallRisk);

        return AIDTO.InteractionCheckResponse.builder()
                .warnings(warnings)
                .safeCombinatons(safeCombos)
                .overallRisk(overallRisk)
                .generalAdvice(advice)
                .build();
    }

    private void checkPairInteractions(Product p1, Product p2,
                                       List<AIDTO.InteractionWarning> warnings,
                                       List<AIDTO.InteractionInfo> safeCombos) {
        String p1Search = buildSearchString(p1);
        String p2Search = buildSearchString(p2);

        for (InteractionRule rule : INTERACTION_RULES) {
            if (rule.beneficial) {
                if ((p1Search.contains(rule.substance1Lower) && p2Search.contains(rule.substance2Lower)) ||
                    (p1Search.contains(rule.substance2Lower) && p2Search.contains(rule.substance1Lower))) {
                    safeCombos.add(AIDTO.InteractionInfo.builder()
                            .product1(p1.getName()).product2(p2.getName())
                            .benefit(rule.description).build());
                }
            } else {
                if ((p1Search.contains(rule.substance1Lower) && p2Search.contains(rule.substance2Lower)) ||
                    (p1Search.contains(rule.substance2Lower) && p2Search.contains(rule.substance1Lower))) {
                    warnings.add(AIDTO.InteractionWarning.builder()
                            .severity(rule.severity).product1(p1.getName()).product2(p2.getName())
                            .description(rule.description).recommendation(rule.recommendation).build());
                }
            }
        }
    }

    private void checkMedicationInteractions(Product product, String medication,
                                             List<AIDTO.InteractionWarning> warnings) {
        String prodSearch = buildSearchString(product);
        String medLower = medication.toLowerCase();

        for (InteractionRule rule : INTERACTION_RULES) {
            if (rule.beneficial) continue;
            if ((prodSearch.contains(rule.substance1Lower) && medLower.contains(rule.substance2Lower)) ||
                (prodSearch.contains(rule.substance2Lower) && medLower.contains(rule.substance1Lower))) {
                warnings.add(AIDTO.InteractionWarning.builder()
                        .severity(rule.severity).product1(product.getName()).product2(medication + " (medication)")
                        .description(rule.description).recommendation(rule.recommendation).build());
            }
        }
    }

    private String buildSearchString(Product p) {
        return ((p.getName() != null ? p.getName() : "") + " " +
                (p.getIngredients() != null ? p.getIngredients() : "") + " " +
                (p.getTags() != null ? p.getTags() : "") + " " +
                (p.getDescription() != null ? p.getDescription() : "")).toLowerCase();
    }

    private List<String> generateAdvice(List<AIDTO.InteractionWarning> warnings, String risk) {
        List<String> advice = new ArrayList<>();
        if ("high".equals(risk)) {
            advice.add("⚠️ Critical interactions detected — consult your healthcare provider before proceeding");
            advice.add("Do not start any new supplement without medical clearance");
        } else if ("moderate".equals(risk)) {
            advice.add("Some moderate interactions found — timing adjustments may help");
            advice.add("Consider spacing out supplement intake throughout the day");
        } else if ("low".equals(risk)) {
            advice.add("Minor interactions detected — generally safe with proper timing");
        } else {
            advice.add("✅ No significant interactions detected between your selected products");
        }
        advice.add("Always inform your healthcare provider about all supplements you take");
        advice.add("Store supplements according to label instructions for maximum potency");
        return advice;
    }

    // ===== Helper classes =====
    private static class InteractionRule {
        String substance1Lower;
        String substance2Lower;
        String severity;
        String description;
        String recommendation;
        boolean beneficial;
    }

    private static void addRule(String s1, String s2, String severity, String desc, String rec) {
        InteractionRule rule = new InteractionRule();
        rule.substance1Lower = s1.toLowerCase();
        rule.substance2Lower = s2.toLowerCase();
        rule.severity = severity;
        rule.description = desc;
        rule.recommendation = rec;
        rule.beneficial = false;
        INTERACTION_RULES.add(rule);
    }

    private static void addBeneficial(String s1, String s2, String benefit) {
        InteractionRule rule = new InteractionRule();
        rule.substance1Lower = s1.toLowerCase();
        rule.substance2Lower = s2.toLowerCase();
        rule.description = benefit;
        rule.beneficial = true;
        INTERACTION_RULES.add(rule);
    }
}
