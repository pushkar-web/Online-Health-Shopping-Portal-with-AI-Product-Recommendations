package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthLiteracyService {

    private final GroqService groqService;
    private final RAGKnowledgeBase knowledgeBase;

    // 20 health topics organized by category
    private static final List<AIDTO.LessonTopic> TOPIC_CATALOG = List.of(
            new AIDTO.LessonTopic("vitamins-101", "Vitamins 101", "Understanding essential vitamins and what they do", "nutrition", "beginner"),
            new AIDTO.LessonTopic("minerals-guide", "Essential Minerals", "Iron, Zinc, Magnesium — why your body needs them", "nutrition", "beginner"),
            new AIDTO.LessonTopic("omega-3-science", "The Science of Omega-3", "How fatty acids protect your heart and brain", "nutrition", "intermediate"),
            new AIDTO.LessonTopic("gut-microbiome", "Your Gut Microbiome", "Probiotics, prebiotics, and digestive health", "digestion", "intermediate"),
            new AIDTO.LessonTopic("bioavailability", "Bioavailability Explained", "Why HOW you take supplements matters as much as WHAT", "science", "advanced"),
            new AIDTO.LessonTopic("vitamin-d-sunlight", "Vitamin D & Sunlight", "The sunshine vitamin — sources, deficiency, and dosing", "nutrition", "beginner"),
            new AIDTO.LessonTopic("turmeric-curcumin", "Turmeric & Curcumin", "Anti-inflammatory benefits and piperine absorption", "herbal", "intermediate"),
            new AIDTO.LessonTopic("sleep-supplements", "Sleep Science & Supplements", "Melatonin, magnesium, and natural sleep aids", "sleep", "beginner"),
            new AIDTO.LessonTopic("protein-types", "Protein Types Compared", "Whey vs plant vs collagen — when to use each", "fitness", "intermediate"),
            new AIDTO.LessonTopic("antioxidants", "Antioxidants Decoded", "Free radicals, oxidative stress, and cellular protection", "science", "intermediate"),
            new AIDTO.LessonTopic("immune-system", "Immune System Boosting", "How immunity works and which supplements truly help", "immunity", "beginner"),
            new AIDTO.LessonTopic("blood-sugar", "Blood Sugar Management", "Chromium, berberine, and dietary strategies for glucose control", "chronic", "advanced"),
            new AIDTO.LessonTopic("joint-health", "Joint Health & Mobility", "Glucosamine, collagen, and anti-inflammatory compounds", "bones", "intermediate"),
            new AIDTO.LessonTopic("stress-adaptogens", "Adaptogens for Stress", "Ashwagandha, Rhodiola, and how adaptogens work", "mental", "intermediate"),
            new AIDTO.LessonTopic("reading-labels", "How to Read Supplement Labels", "Understanding dosages, daily values, and certifications", "science", "beginner"),
            new AIDTO.LessonTopic("drug-interactions", "Supplement-Drug Interactions", "Critical interactions every supplement user should know", "safety", "advanced"),
            new AIDTO.LessonTopic("heart-health", "Heart Health Essentials", "CoQ10, Omega-3, and supplements for cardiovascular health", "heart", "intermediate"),
            new AIDTO.LessonTopic("hair-skin-nails", "Hair, Skin & Nails", "Biotin, collagen, and the science behind beauty supplements", "beauty", "beginner"),
            new AIDTO.LessonTopic("weight-management", "Weight Management Science", "Metabolism, thermogenics, and evidence-based supplements", "fitness", "advanced"),
            new AIDTO.LessonTopic("prenatal-health", "Prenatal Nutrition", "Folate, iron, DHA — essential nutrients for pregnancy", "women", "intermediate")
    );

    public List<AIDTO.LessonTopic> getAllTopics() {
        return TOPIC_CATALOG;
    }

    public AIDTO.LessonResponse generateLesson(String topicId, String level) {
        long startTime = System.currentTimeMillis();

        AIDTO.LessonTopic topic = TOPIC_CATALOG.stream()
                .filter(t -> t.getId().equals(topicId))
                .findFirst()
                .orElse(new AIDTO.LessonTopic(topicId, topicId, "Health topic", "general", "beginner"));

        String effectiveLevel = (level != null && !level.isEmpty()) ? level : topic.getDefaultLevel();

        // Get RAG context for grounding
        String context = knowledgeBase.getContextForQuery(topic.getTitle() + " " + topic.getDescription(), 5);

        String systemPrompt = """
                You are a health education content creator. Generate a structured lesson in JSON format.
                Difficulty level: %s

                RESPOND ONLY WITH JSON:
                {
                  "title": "Lesson title",
                  "introduction": "A 2-3 sentence intro to hook the reader",
                  "sections": [
                    {"heading": "Section title", "content": "2-3 paragraphs of content. Use plain language."}
                  ],
                  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
                  "quiz": [
                    {"question": "Question text?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Why this is correct"}
                  ],
                  "relatedProductTypes": ["product type 1", "product type 2"]
                }

                RULES:
                - %s level: use %s
                - Generate exactly 3-4 sections
                - Generate exactly 3 key takeaways
                - Generate exactly 3 quiz questions (4 options each)
                - Base content on the provided product context when relevant
                - Include practical, actionable advice
                - Cite specific supplement types and dosage ranges when appropriate
                """.formatted(effectiveLevel, effectiveLevel,
                effectiveLevel.equals("beginner") ? "simple everyday language, short sentences, relatable analogies" :
                        effectiveLevel.equals("intermediate") ? "moderate technical terms with explanations, detailed examples" :
                                "scientific terminology, research references, detailed mechanisms");

        String userPrompt = "=== PRODUCT CONTEXT ===\n" + context +
                "\n\n=== TOPIC ===\nTitle: " + topic.getTitle() +
                "\nDescription: " + topic.getDescription() +
                "\nCategory: " + topic.getCategory();

        String aiResponse = groqService.chat(systemPrompt, userPrompt);
        AIDTO.LessonResponse lesson = parseLessonResponse(aiResponse);
        lesson.setTopicId(topicId);
        lesson.setLevel(effectiveLevel);
        lesson.setCategory(topic.getCategory());
        lesson.setResponseTimeMs(System.currentTimeMillis() - startTime);

        return lesson;
    }

    public AIDTO.QuizResultResponse evaluateQuiz(String topicId, List<Integer> answers) {
        // Simple scoring — in a real app, store correct answers server-side
        // For now, just return the score and let the frontend compare
        int total = answers.size();
        return AIDTO.QuizResultResponse.builder()
                .topicId(topicId)
                .totalQuestions(total)
                .message("Quiz submitted! Review the explanations for each question above.")
                .build();
    }

    private AIDTO.LessonResponse parseLessonResponse(String aiResponse) {
        AIDTO.LessonResponse lesson = new AIDTO.LessonResponse();
        try {
            String json = aiResponse;
            if (json.contains("```json")) {
                json = json.substring(json.indexOf("```json") + 7);
                json = json.substring(0, json.indexOf("```"));
            } else if (json.contains("```")) {
                json = json.substring(json.indexOf("```") + 3);
                json = json.substring(0, json.indexOf("```"));
            }
            json = json.trim();

            lesson.setTitle(extractStr(json, "title"));
            lesson.setIntroduction(extractStr(json, "introduction"));
            lesson.setKeyTakeaways(extractArr(json, "keyTakeaways"));
            lesson.setRelatedProductTypes(extractArr(json, "relatedProductTypes"));

            // Parse sections
            List<AIDTO.LessonSection> sections = new ArrayList<>();
            int secStart = json.indexOf("\"sections\"");
            if (secStart != -1) {
                int arrStart = json.indexOf("[", secStart);
                int arrEnd = findMatchingBracket(json, arrStart);
                if (arrStart != -1 && arrEnd != -1) {
                    String arrStr = json.substring(arrStart + 1, arrEnd);
                    int objStart = 0;
                    while ((objStart = arrStr.indexOf("{", objStart)) != -1) {
                        int objEnd = findMatchingBrace(arrStr, objStart);
                        if (objEnd == -1) break;
                        String obj = arrStr.substring(objStart, objEnd + 1);
                        sections.add(AIDTO.LessonSection.builder()
                                .heading(extractStr(obj, "heading"))
                                .content(extractStr(obj, "content"))
                                .build());
                        objStart = objEnd + 1;
                    }
                }
            }
            lesson.setSections(sections);

            // Parse quiz
            List<AIDTO.QuizQuestion> quizItems = new ArrayList<>();
            int quizStart = json.indexOf("\"quiz\"");
            if (quizStart != -1) {
                int arrStart = json.indexOf("[", quizStart);
                int arrEnd = findMatchingBracket(json, arrStart);
                if (arrStart != -1 && arrEnd != -1) {
                    String arrStr = json.substring(arrStart + 1, arrEnd);
                    int objStart = 0;
                    while ((objStart = arrStr.indexOf("{", objStart)) != -1) {
                        int objEnd = findMatchingBrace(arrStr, objStart);
                        if (objEnd == -1) break;
                        String obj = arrStr.substring(objStart, objEnd + 1);
                        String correctStr = extractStr(obj, "correctIndex");
                        int correct = 0;
                        try { correct = Integer.parseInt(correctStr.replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
                        quizItems.add(AIDTO.QuizQuestion.builder()
                                .question(extractStr(obj, "question"))
                                .options(extractArr(obj, "options"))
                                .correctIndex(correct)
                                .explanation(extractStr(obj, "explanation"))
                                .build());
                        objStart = objEnd + 1;
                    }
                }
            }
            lesson.setQuiz(quizItems);

        } catch (Exception e) {
            log.warn("Failed to parse lesson response: {}", e.getMessage());
            lesson.setTitle("Health Lesson");
            lesson.setIntroduction(aiResponse);
            lesson.setSections(List.of());
            lesson.setQuiz(List.of());
            lesson.setKeyTakeaways(List.of());
        }
        return lesson;
    }

    private int findMatchingBracket(String s, int pos) {
        if (pos == -1) return -1;
        int d = 0;
        for (int i = pos; i < s.length(); i++) {
            if (s.charAt(i) == '[') d++;
            else if (s.charAt(i) == ']') { d--; if (d == 0) return i; }
        }
        return -1;
    }

    private int findMatchingBrace(String s, int pos) {
        if (pos == -1) return -1;
        int d = 0;
        for (int i = pos; i < s.length(); i++) {
            if (s.charAt(i) == '{') d++;
            else if (s.charAt(i) == '}') { d--; if (d == 0) return i; }
        }
        return -1;
    }

    private String extractStr(String json, String key) {
        String sk = "\"" + key + "\"";
        int ki = json.indexOf(sk);
        if (ki == -1) return "";
        int ci = json.indexOf(":", ki);
        if (ci == -1) return "";
        String rest = json.substring(ci + 1).trim();
        if (!rest.startsWith("\"")) return "";
        int qe = 1;
        while (qe < rest.length()) {
            if (rest.charAt(qe) == '"' && rest.charAt(qe - 1) != '\\') break;
            qe++;
        }
        return qe < rest.length() ? rest.substring(1, qe).replace("\\n", "\n").replace("\\\"", "\"") : "";
    }

    private List<String> extractArr(String json, String key) {
        String sk = "\"" + key + "\"";
        int ki = json.indexOf(sk);
        if (ki == -1) return List.of();
        int bs = json.indexOf("[", ki);
        if (bs == -1) return List.of();
        int be = json.indexOf("]", bs);
        if (be == -1) return List.of();
        String arr = json.substring(bs + 1, be);
        List<String> items = new ArrayList<>();
        int pos = 0;
        while (pos < arr.length()) {
            int qs = arr.indexOf("\"", pos);
            if (qs == -1) break;
            int qe = qs + 1;
            while (qe < arr.length()) {
                if (arr.charAt(qe) == '"' && arr.charAt(qe - 1) != '\\') break;
                qe++;
            }
            if (qe < arr.length()) items.add(arr.substring(qs + 1, qe));
            pos = qe + 1;
        }
        return items;
    }
}
