package com.healthshop.ai;

import com.healthshop.model.*;
import com.healthshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * RAG Knowledge Base — indexes all PostgreSQL data into an in-memory vector store
 * for real-time retrieval-augmented generation. Auto-refreshes every 30 minutes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RAGKnowledgeBase {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserHealthProfileRepository healthProfileRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    // In-memory knowledge chunks with metadata
    private final List<KnowledgeChunk> knowledgeChunks = Collections.synchronizedList(new ArrayList<>());
    private final Map<String, List<KnowledgeChunk>> categoryIndex = new ConcurrentHashMap<>();
    private final Map<String, List<KnowledgeChunk>> topicIndex = new ConcurrentHashMap<>();

    // Health domain knowledge base
    private static final Map<String, String> HEALTH_KNOWLEDGE = new LinkedHashMap<>();
    static {
        HEALTH_KNOWLEDGE.put("vitamins_overview",
                "Vitamins are essential micronutrients that the body needs for normal cell function, growth, and development. " +
                "There are 13 essential vitamins: A, C, D, E, K, and 8 B vitamins. Fat-soluble vitamins (A, D, E, K) are stored " +
                "in body fat. Water-soluble vitamins (C and B-complex) need to be consumed regularly as the body doesn't store them.");

        HEALTH_KNOWLEDGE.put("supplements_safety",
                "Dietary supplements can interact with medications and each other. Always consult a healthcare provider before " +
                "starting new supplements, especially if pregnant, nursing, or taking prescription medications. Look for third-party " +
                "testing certifications like USP, NSF, or ConsumerLab. Follow recommended dosages and be aware of upper intake limits.");

        HEALTH_KNOWLEDGE.put("immunity_support",
                "Key nutrients for immune support include Vitamin C (500-1000mg daily), Vitamin D3 (1000-4000 IU daily), Zinc " +
                "(15-30mg daily), Elderberry extract, and Probiotics. Adequate sleep (7-9 hours), regular exercise, stress management, " +
                "and a balanced diet rich in fruits and vegetables are the foundation of a strong immune system.");

        HEALTH_KNOWLEDGE.put("heart_health",
                "Omega-3 fatty acids (EPA/DHA) support cardiovascular health. CoQ10 (100-300mg) supports heart muscle energy. " +
                "Magnesium helps maintain healthy blood pressure. Plant sterols can reduce LDL cholesterol. " +
                "Regular cardiovascular exercise, a Mediterranean-style diet, stress reduction, and maintaining healthy weight are essential.");

        HEALTH_KNOWLEDGE.put("bone_joint_health",
                "Calcium (1000-1200mg daily) and Vitamin D3 (1000-2000 IU) are essential for bone health. Glucosamine and chondroitin " +
                "support joint cartilage. Collagen peptides (10g daily) support connective tissue. Turmeric/curcumin has anti-inflammatory " +
                "properties. Weight-bearing exercise strengthens bones; low-impact exercise protects joints.");

        HEALTH_KNOWLEDGE.put("digestive_health",
                "Probiotics (multiple strains, 10-50 billion CFU) support gut microbiome diversity. Prebiotics (fiber) feed beneficial " +
                "bacteria. Digestive enzymes help break down proteins, fats, and carbohydrates. L-Glutamine supports gut lining. " +
                "Eat slowly, stay hydrated, include fermented foods, and manage stress for optimal digestion.");

        HEALTH_KNOWLEDGE.put("sleep_wellness",
                "Melatonin (0.5-5mg, 30-60 min before bed) regulates circadian rhythm. Magnesium glycinate (200-400mg) promotes " +
                "relaxation. Valerian root and chamomile are traditional sleep aids. L-Theanine (100-200mg) reduces anxiety without " +
                "drowsiness. Maintain consistent sleep schedule, dark cool room, limit screens, avoid caffeine after 2pm.");

        HEALTH_KNOWLEDGE.put("stress_mental_health",
                "Ashwagandha (300-600mg) is an adaptogen that may reduce cortisol. B-complex vitamins support nervous system function. " +
                "Magnesium helps muscle relaxation and nervous system. Omega-3s support brain health. Rhodiola rosea combats mental fatigue. " +
                "Practice mindfulness, regular exercise, adequate sleep, social connection, and professional support when needed.");

        HEALTH_KNOWLEDGE.put("skin_hair_health",
                "Biotin (2500-5000mcg) supports hair and nail growth. Collagen peptides (10g daily) improve skin elasticity. " +
                "Vitamin C supports collagen synthesis. Vitamin E protects against oxidative damage. Hyaluronic acid supports skin hydration. " +
                "Zinc supports wound healing. Stay hydrated, use sun protection, eat antioxidant-rich foods.");

        HEALTH_KNOWLEDGE.put("weight_management",
                "Green tea extract (EGCG) may boost metabolism. CLA (conjugated linoleic acid) may reduce body fat. Fiber supplements " +
                "promote satiety. Chromium supports blood sugar balance. Protein supplements support lean muscle. " +
                "Focus on caloric deficit through whole foods, regular exercise, adequate protein, sleep, and stress management.");

        HEALTH_KNOWLEDGE.put("diabetic_care",
                "Chromium picolinate (200-1000mcg) may improve insulin sensitivity. Berberine (500mg 2-3x daily) may lower blood glucose. " +
                "Alpha-lipoic acid (300-600mg) supports nerve health. Cinnamon extract may improve insulin sensitivity. Magnesium supports " +
                "glucose metabolism. Monitor blood sugar regularly, follow medical advice, maintain healthy weight, exercise regularly.");

        HEALTH_KNOWLEDGE.put("fitness_performance",
                "Creatine monohydrate (3-5g daily) enhances strength and power. BCAAs support muscle recovery. Beta-alanine (3-6g) " +
                "improves endurance. Whey protein (20-40g post-workout) maximizes muscle protein synthesis. Caffeine (3-6mg/kg) " +
                "improves performance. Electrolytes for hydration. Progressive overload, adequate rest, proper nutrition timing matter.");

        HEALTH_KNOWLEDGE.put("eye_health",
                "Lutein (10mg) and Zeaxanthin (2mg) protect macular health. Vitamin A supports night vision. Omega-3 DHA concentrates " +
                "in the retina. Bilberry supports visual acuity. Astaxanthin reduces eye fatigue. Follow 20-20-20 rule for screen time, " +
                "wear UV protection, eat colorful fruits and vegetables, get regular eye exams.");

        HEALTH_KNOWLEDGE.put("energy_vitality",
                "Iron deficiency is a common cause of fatigue, especially in women. B12 and folate support red blood cell production. " +
                "CoQ10 (100-200mg) supports cellular energy (ATP). Adaptogenic herbs like ashwagandha and rhodiola combat fatigue. " +
                "Ensure adequate sleep, stay hydrated, exercise regularly, manage stress, and eat balanced meals.");

        HEALTH_KNOWLEDGE.put("pregnancy_prenatal",
                "Folate/folic acid (at least 400mcg) prevents neural tube defects. DHA (200-300mg) supports fetal brain development. " +
                "Iron (27mg) prevents anemia. Calcium (1000mg) for bone development. Prenatal multivitamins cover essential bases. " +
                "Always consult OB/GYN before taking any supplements during pregnancy or breastfeeding.");
    }

    @PostConstruct
    public void initialize() {
        log.info("Initializing RAG Knowledge Base...");
        refreshKnowledgeBase();
        log.info("RAG Knowledge Base initialized with {} chunks", knowledgeChunks.size());
    }

    @Scheduled(fixedRate = 1800000) // Refresh every 30 minutes
    public void refreshKnowledgeBase() {
        log.info("Refreshing RAG Knowledge Base...");
        List<KnowledgeChunk> newChunks = new ArrayList<>();

        // 1. Index all products
        try {
            List<Product> products = productRepository.findAll();
            for (Product p : products) {
                String content = buildProductChunk(p);
                KnowledgeChunk chunk = new KnowledgeChunk(
                        "product", p.getId().toString(), p.getName(), content,
                        extractKeywords(content), p.getCategory() != null ? p.getCategory().getName() : "General"
                );
                newChunks.add(chunk);
            }
            log.info("Indexed {} products", products.size());
        } catch (Exception e) {
            log.error("Error indexing products: {}", e.getMessage());
        }

        // 2. Index categories
        try {
            List<Category> categories = categoryRepository.findAll();
            for (Category c : categories) {
                String content = String.format("Category: %s. %s. Contains health products related to %s.",
                        c.getName(), c.getDescription() != null ? c.getDescription() : "", c.getName().toLowerCase());
                newChunks.add(new KnowledgeChunk("category", c.getId().toString(), c.getName(), content,
                        extractKeywords(content), c.getName()));
            }
            log.info("Indexed {} categories", categories.size());
        } catch (Exception e) {
            log.error("Error indexing categories: {}", e.getMessage());
        }

        // 3. Index health domain knowledge
        for (Map.Entry<String, String> entry : HEALTH_KNOWLEDGE.entrySet()) {
            newChunks.add(new KnowledgeChunk("knowledge", entry.getKey(),
                    entry.getKey().replace("_", " "), entry.getValue(),
                    extractKeywords(entry.getValue()), "health_knowledge"));
        }
        log.info("Indexed {} health knowledge articles", HEALTH_KNOWLEDGE.size());

        // 4. Index aggregate statistics
        try {
            long totalProducts = productRepository.count();
            List<Category> categories = categoryRepository.findAll();
            StringBuilder statsContent = new StringBuilder();
            statsContent.append(String.format("Our health store has %d products across %d categories. ", totalProducts, categories.size()));
            for (Category c : categories) {
                long catCount = productRepository.countByCategoryId(c.getId());
                statsContent.append(String.format("%s has %d products. ", c.getName(), catCount));
            }
            newChunks.add(new KnowledgeChunk("stats", "store_overview", "Store Overview",
                    statsContent.toString(), extractKeywords(statsContent.toString()), "overview"));
        } catch (Exception e) {
            log.error("Error indexing stats: {}", e.getMessage());
        }

        // 5. Index popular/trending insights
        try {
            List<Product> trending = productRepository.findTop20ByActiveOrderByPurchaseCountDesc(true);
            if (!trending.isEmpty()) {
                StringBuilder trendContent = new StringBuilder("Currently trending products: ");
                for (Product tp : trending.subList(0, Math.min(10, trending.size()))) {
                    trendContent.append(String.format("%s (%.1f stars, %d purchases), ",
                            tp.getName(), tp.getAverageRating(), tp.getPurchaseCount()));
                }
                newChunks.add(new KnowledgeChunk("trending", "trending_products", "Trending Products",
                        trendContent.toString(), extractKeywords(trendContent.toString()), "trending"));
            }
        } catch (Exception e) {
            log.error("Error indexing trending: {}", e.getMessage());
        }

        // 6. Index top-reviewed products insights
        try {
            List<Product> topRated = productRepository.findTop20ByActiveOrderByAverageRatingDesc(true);
            if (!topRated.isEmpty()) {
                StringBuilder ratedContent = new StringBuilder("Top-rated products: ");
                for (Product rp : topRated.subList(0, Math.min(10, topRated.size()))) {
                    ratedContent.append(String.format("%s (%.1f stars, %d reviews), ",
                            rp.getName(), rp.getAverageRating(), rp.getReviewCount()));
                }
                newChunks.add(new KnowledgeChunk("top_rated", "top_rated_products", "Top Rated Products",
                        ratedContent.toString(), extractKeywords(ratedContent.toString()), "ratings"));
            }
        } catch (Exception e) {
            log.error("Error indexing top-rated: {}", e.getMessage());
        }

        // Replace the knowledge base atomically
        synchronized (knowledgeChunks) {
            knowledgeChunks.clear();
            knowledgeChunks.addAll(newChunks);
        }

        // Rebuild indexes
        rebuildIndexes();
        log.info("RAG Knowledge Base refreshed: {} total chunks", knowledgeChunks.size());
    }

    private void rebuildIndexes() {
        categoryIndex.clear();
        topicIndex.clear();

        for (KnowledgeChunk chunk : knowledgeChunks) {
            categoryIndex.computeIfAbsent(chunk.getCategory().toLowerCase(), k -> new ArrayList<>()).add(chunk);
            for (String keyword : chunk.getKeywords()) {
                topicIndex.computeIfAbsent(keyword.toLowerCase(), k -> new ArrayList<>()).add(chunk);
            }
        }
    }

    /**
     * Retrieve the most relevant knowledge chunks for a given query
     */
    public List<KnowledgeChunk> retrieve(String query, int topK) {
        if (query == null || query.isBlank()) return List.of();

        String lowerQuery = query.toLowerCase();
        String[] queryWords = lowerQuery.split("\\W+");
        Set<String> queryWordSet = new HashSet<>(Arrays.asList(queryWords));

        // Score each chunk against the query using TF-IDF-like relevance
        List<Map.Entry<KnowledgeChunk, Double>> scored = new ArrayList<>();

        for (KnowledgeChunk chunk : knowledgeChunks) {
            double score = 0;

            // Keyword overlap scoring
            for (String keyword : chunk.getKeywords()) {
                if (queryWordSet.contains(keyword.toLowerCase())) {
                    score += 2.0;
                }
                // Partial match
                for (String qw : queryWords) {
                    if (keyword.toLowerCase().contains(qw) || qw.contains(keyword.toLowerCase())) {
                        score += 0.5;
                    }
                }
            }

            // Title match bonus
            String lowerTitle = chunk.getTitle().toLowerCase();
            for (String qw : queryWords) {
                if (lowerTitle.contains(qw)) score += 3.0;
            }

            // Content substring match
            String lowerContent = chunk.getContent().toLowerCase();
            for (String qw : queryWords) {
                if (qw.length() >= 3 && lowerContent.contains(qw)) {
                    score += 1.0;
                }
            }

            // Boost knowledge articles for general health questions
            if (chunk.getType().equals("knowledge")) {
                score *= 1.5;
            }

            if (score > 0) {
                scored.add(Map.entry(chunk, score));
            }
        }

        // Sort by score descending and return top-K
        return scored.stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(topK)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve chunks by category
     */
    public List<KnowledgeChunk> retrieveByCategory(String category, int topK) {
        List<KnowledgeChunk> chunks = categoryIndex.getOrDefault(category.toLowerCase(), List.of());
        return chunks.stream().limit(topK).collect(Collectors.toList());
    }

    /**
     * Get a formatted context string from relevant chunks for the LLM
     */
    public String getContextForQuery(String query, int maxChunks) {
        List<KnowledgeChunk> relevant = retrieve(query, maxChunks);
        if (relevant.isEmpty()) return "No specific context found for this query.";

        StringBuilder context = new StringBuilder();
        for (int i = 0; i < relevant.size(); i++) {
            KnowledgeChunk chunk = relevant.get(i);
            context.append(String.format("[Source %d - %s] %s\n\n", i + 1, chunk.getType(), chunk.getContent()));
        }
        return context.toString();
    }

    public int getChunkCount() {
        return knowledgeChunks.size();
    }

    public Map<String, Long> getChunkCountByType() {
        return knowledgeChunks.stream()
                .collect(Collectors.groupingBy(KnowledgeChunk::getType, Collectors.counting()));
    }

    // ========== HELPERS ==========

    private String buildProductChunk(Product p) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Product: %s", p.getName()));
        if (p.getBrand() != null) sb.append(String.format(" by %s", p.getBrand()));
        sb.append(String.format(". Price: $%.2f", p.getPrice()));
        if (p.getDiscountPrice() != null && p.getDiscountPrice() > 0) {
            sb.append(String.format(" (on sale: $%.2f)", p.getDiscountPrice()));
        }
        sb.append(String.format(". Rating: %.1f/5 (%d reviews).", p.getAverageRating(), p.getReviewCount()));
        if (p.getDescription() != null) sb.append(" ").append(truncate(p.getDescription(), 200));
        if (p.getIngredients() != null) sb.append(" Ingredients: ").append(truncate(p.getIngredients(), 150));
        if (p.getBenefits() != null) sb.append(" Benefits: ").append(truncate(p.getBenefits(), 150));
        if (p.getHealthGoals() != null) sb.append(" Health Goals: ").append(p.getHealthGoals());
        if (p.getDosage() != null) sb.append(" Dosage: ").append(p.getDosage());
        if (p.getCategory() != null) sb.append(" Category: ").append(p.getCategory().getName());
        if (p.getDietaryInfo() != null) sb.append(" Dietary: ").append(p.getDietaryInfo());
        return sb.toString();
    }

    private Set<String> extractKeywords(String text) {
        if (text == null) return Set.of();
        // Common stop words to filter out
        Set<String> stopWords = Set.of("the", "a", "an", "is", "in", "at", "of", "and", "or",
                "to", "for", "with", "on", "by", "from", "are", "was", "has", "had", "this",
                "that", "it", "its", "be", "not", "but", "can", "may", "our", "all", "your");

        return Arrays.stream(text.toLowerCase().split("\\W+"))
                .filter(w -> w.length() >= 3 && !stopWords.contains(w))
                .collect(Collectors.toSet());
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...";
    }

    // ========== INNER CLASS ==========

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class KnowledgeChunk {
        private String type;       // "product", "category", "knowledge", "stats", "trending", "top_rated"
        private String sourceId;
        private String title;
        private String content;
        private Set<String> keywords;
        private String category;
    }
}
