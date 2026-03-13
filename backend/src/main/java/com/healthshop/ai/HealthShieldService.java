package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.dto.ProductDTO;
import com.healthshop.model.Product;
import com.healthshop.model.UserHealthProfile;
import com.healthshop.repository.ProductRepository;
import com.healthshop.repository.UserHealthProfileRepository;
import com.healthshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthShieldService {

    private final GroqService groqService;
    private final UserHealthProfileRepository healthProfileRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    // Seasonal threats database: month -> threats
    private static final Map<Integer, List<SeasonalThreat>> SEASONAL_THREATS = new LinkedHashMap<>();

    static {
        // Winter (Nov-Feb): Flu, Vitamin D deficiency, dry skin
        for (int m : new int[]{11, 12, 1, 2}) {
            SEASONAL_THREATS.put(m, List.of(
                    new SeasonalThreat("Flu & Cold Season", "severe", "Influenza and common cold peak during winter months", List.of("vitamin-c", "zinc", "elderberry", "immunity", "echinacea"), List.of("elderly", "children", "weak immunity")),
                    new SeasonalThreat("Vitamin D Deficiency", "moderate", "Reduced sunlight exposure leads to low Vitamin D levels", List.of("vitamin-d", "calcium", "bone-health"), List.of("elderly", "indoor workers", "dark skin")),
                    new SeasonalThreat("Dry Skin & Respiratory Issues", "mild", "Cold dry air causes skin cracking and respiratory irritation", List.of("collagen", "vitamin-e", "omega-3", "skin-care"), List.of("eczema", "asthma", "sensitive skin"))
            ));
        }
        // Spring (Mar-Apr): Allergies
        for (int m : new int[]{3, 4}) {
            SEASONAL_THREATS.put(m, List.of(
                    new SeasonalThreat("Spring Allergies", "moderate", "Pollen levels surge causing allergic rhinitis and asthma attacks", List.of("quercetin", "vitamin-c", "probiotics", "immunity"), List.of("allergies", "asthma", "hay fever")),
                    new SeasonalThreat("Energy Slump", "mild", "Seasonal transition can cause fatigue and mood changes", List.of("b-complex", "iron", "ashwagandha", "energy"), List.of("fatigue", "mood disorders")),
                    new SeasonalThreat("Post-Winter Immunity Gap", "moderate", "Immune system weakened after winter months", List.of("zinc", "vitamin-c", "elderberry", "probiotics"), List.of("frequent illness", "elderly"))
            ));
        }
        // Summer (May-Jul): Dehydration, heat stroke, UV damage
        for (int m : new int[]{5, 6, 7}) {
            SEASONAL_THREATS.put(m, List.of(
                    new SeasonalThreat("Dehydration & Electrolyte Loss", "severe", "Heat causes excessive sweating and electrolyte depletion", List.of("electrolyte", "magnesium", "potassium", "hydration"), List.of("elderly", "athletes", "outdoor workers")),
                    new SeasonalThreat("Heat-Related Digestive Issues", "moderate", "Food spoilage and bacterial growth increase in summer", List.of("probiotics", "digestive-enzyme", "fiber", "gut-health"), List.of("sensitive stomach", "IBS")),
                    new SeasonalThreat("UV Skin Damage", "moderate", "Increased sun exposure leads to skin damage and aging", List.of("vitamin-c", "vitamin-e", "collagen", "antioxidant"), List.of("fair skin", "sun exposure"))
            ));
        }
        // Monsoon (Aug-Sep): Waterborne diseases, infections
        for (int m : new int[]{8, 9}) {
            SEASONAL_THREATS.put(m, List.of(
                    new SeasonalThreat("Waterborne Infections", "severe", "Contaminated water causes typhoid, cholera, and gastroenteritis", List.of("probiotics", "zinc", "immunity", "electrolyte"), List.of("children", "elderly", "weak immunity")),
                    new SeasonalThreat("Mosquito-Borne Diseases", "severe", "Dengue, malaria risk peaks during monsoon", List.of("immunity", "vitamin-c", "iron", "zinc"), List.of("tropical regions", "outdoor exposure")),
                    new SeasonalThreat("Fungal Infections", "moderate", "Humidity breeds fungal skin and nail infections", List.of("probiotics", "tea-tree", "vitamin-c", "skin-care"), List.of("diabetes", "humid climate"))
            ));
        }
        // Autumn (Oct): Transition period
        SEASONAL_THREATS.put(10, List.of(
                new SeasonalThreat("Pre-Winter Immunity Prep", "moderate", "Prepare immune system before cold season begins", List.of("vitamin-c", "vitamin-d", "zinc", "elderberry", "immunity"), List.of("elderly", "children", "chronic conditions")),
                new SeasonalThreat("Joint Pain Flare-Ups", "moderate", "Temperature drops trigger arthritis and joint stiffness", List.of("glucosamine", "turmeric", "omega-3", "joint-support"), List.of("arthritis", "elderly", "joint issues")),
                new SeasonalThreat("Seasonal Mood Changes", "mild", "Reduced daylight can affect mood and energy", List.of("vitamin-d", "omega-3", "st-johns-wort", "b-complex"), List.of("mood disorders", "depression"))
        ));
    }

    public AIDTO.HealthShieldResponse getPersonalizedShield(Long userId) {
        long startTime = System.currentTimeMillis();
        int currentMonth = LocalDate.now().getMonthValue();
        String currentMonthName = Month.of(currentMonth).name();

        // Get current + next 2 months' threats
        List<AIDTO.ThreatAlert> allThreats = new ArrayList<>();
        for (int offset = 0; offset < 3; offset++) {
            int month = ((currentMonth - 1 + offset) % 12) + 1;
            String monthName = Month.of(month).name();
            List<SeasonalThreat> threats = SEASONAL_THREATS.getOrDefault(month, List.of());
            for (SeasonalThreat threat : threats) {
                AIDTO.ThreatAlert alert = AIDTO.ThreatAlert.builder()
                        .name(threat.name)
                        .severity(threat.severity)
                        .description(threat.description)
                        .month(monthName)
                        .monthOffset(offset)
                        .productTags(threat.productTags)
                        .riskFactors(threat.riskFactors)
                        .build();
                allThreats.add(alert);
            }
        }

        // Personalize risk scores based on user profile
        int overallPreparedness = 70; // default
        if (userId != null) {
            Optional<UserHealthProfile> profileOpt = healthProfileRepository.findByUserId(userId);
            if (profileOpt.isPresent()) {
                UserHealthProfile profile = profileOpt.get();
                overallPreparedness = personalizeThreats(allThreats, profile);
            }
        }

        // Get recommended products for top threats
        List<ProductDTO.ProductResponse> recommendedProducts = new ArrayList<>();
        Set<Long> addedIds = new HashSet<>();
        for (AIDTO.ThreatAlert threat : allThreats) {
            if (threat.getMonthOffset() == 0 && threat.getProductTags() != null) {
                for (String tag : threat.getProductTags()) {
                    try {
                        List<Product> found = productRepository.findByTag(tag);
                        for (Product p : found) {
                            if (Boolean.TRUE.equals(p.getActive()) && addedIds.add(p.getId())) {
                                recommendedProducts.add(productService.toResponse(p));
                                if (recommendedProducts.size() >= 12) break;
                            }
                        }
                    } catch (Exception ignored) {}
                    if (recommendedProducts.size() >= 12) break;
                }
            }
        }

        // Build 12-month timeline
        List<AIDTO.MonthThreatSummary> timeline = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            List<SeasonalThreat> threats = SEASONAL_THREATS.getOrDefault(m, List.of());
            String maxSeverity = threats.stream()
                    .map(t -> t.severity)
                    .reduce("none", (a, b) -> severityRank(b) > severityRank(a) ? b : a);
            timeline.add(AIDTO.MonthThreatSummary.builder()
                    .month(Month.of(m).name())
                    .threatCount(threats.size())
                    .maxSeverity(maxSeverity)
                    .isCurrent(m == currentMonth)
                    .build());
        }

        return AIDTO.HealthShieldResponse.builder()
                .currentMonth(currentMonthName)
                .overallPreparedness(overallPreparedness)
                .threats(allThreats)
                .recommendedProducts(recommendedProducts)
                .timeline(timeline)
                .responseTimeMs(System.currentTimeMillis() - startTime)
                .build();
    }

    private int personalizeThreats(List<AIDTO.ThreatAlert> threats, UserHealthProfile profile) {
        int totalRisk = 0;
        int count = 0;
        String conditions = profile.getMedicalConditions() != null ? profile.getMedicalConditions().toLowerCase() : "";
        String allergies = profile.getAllergies() != null ? profile.getAllergies().toLowerCase() : "";
        Integer age = profile.getAge();

        for (AIDTO.ThreatAlert threat : threats) {
            int personalRisk = 50; // base risk
            if (threat.getRiskFactors() != null) {
                for (String factor : threat.getRiskFactors()) {
                    String f = factor.toLowerCase();
                    if (conditions.contains(f) || allergies.contains(f)) personalRisk += 20;
                    if (f.contains("elderly") && age != null && age >= 60) personalRisk += 15;
                    if (f.contains("children") && age != null && age <= 12) personalRisk += 15;
                }
            }
            threat.setPersonalRiskScore(Math.min(100, personalRisk));
            totalRisk += personalRisk;
            count++;
        }

        int avgRisk = count > 0 ? totalRisk / count : 0;
        return Math.max(0, 100 - avgRisk); // Lower risk = higher preparedness
    }

    private int severityRank(String s) {
        return switch (s) {
            case "severe" -> 3;
            case "moderate" -> 2;
            case "mild" -> 1;
            default -> 0;
        };
    }

    // Internal data class
    private record SeasonalThreat(String name, String severity, String description,
                                   List<String> productTags, List<String> riskFactors) {}
}
