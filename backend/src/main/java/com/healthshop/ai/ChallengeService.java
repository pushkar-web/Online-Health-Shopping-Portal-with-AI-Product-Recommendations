package com.healthshop.ai;

import com.healthshop.dto.AIDTO;
import com.healthshop.model.UserHealthProfile;
import com.healthshop.repository.UserHealthProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChallengeService {

    private final GroqService groqService;
    private final UserHealthProfileRepository healthProfileRepository;

    // In-memory storage (avoids DB schema changes — production would use JPA entities)
    private final List<AIDTO.HealthChallenge> challenges = new ArrayList<>();
    private final Map<String, AIDTO.ChallengeParticipation> participations = new ConcurrentHashMap<>();
    // Key: "userId-challengeId"

    @PostConstruct
    public void seedChallenges() {
        challenges.addAll(List.of(
                AIDTO.HealthChallenge.builder().id(1L).title("30-Day Immunity Boost").description("Build a fortress-like immune system in 30 days with daily vitamin, lifestyle, and dietary tasks.")
                        .healthGoal("Immunity").durationDays(30).difficulty("beginner").gradient("from-teal-500 to-emerald-500").icon("Shield").participantCount(1247).rewardPoints(500).build(),
                AIDTO.HealthChallenge.builder().id(2L).title("21-Day Sleep Reset").description("Transform your sleep quality with science-backed nightly routines and supplement strategies.")
                        .healthGoal("Sleep").durationDays(21).difficulty("beginner").gradient("from-blue-500 to-indigo-500").icon("Moon").participantCount(893).rewardPoints(350).build(),
                AIDTO.HealthChallenge.builder().id(3L).title("14-Day Energy Surge").description("Combat fatigue and supercharge your energy with targeted nutrition and activity goals.")
                        .healthGoal("Energy").durationDays(14).difficulty("intermediate").gradient("from-amber-500 to-orange-500").icon("Zap").participantCount(1562).rewardPoints(250).build(),
                AIDTO.HealthChallenge.builder().id(4L).title("30-Day Joint Recovery").description("Reduce joint pain and improve mobility with anti-inflammatory supplements and gentle exercises.")
                        .healthGoal("Joint Health").durationDays(30).difficulty("beginner").gradient("from-green-500 to-lime-500").icon("Bone").participantCount(678).rewardPoints(500).build(),
                AIDTO.HealthChallenge.builder().id(5L).title("21-Day Stress Detox").description("Master stress management through adaptogens, mindfulness, and daily wellness tasks.")
                        .healthGoal("Stress Relief").durationDays(21).difficulty("intermediate").gradient("from-purple-500 to-violet-500").icon("Brain").participantCount(1034).rewardPoints(350).build(),
                AIDTO.HealthChallenge.builder().id(6L).title("28-Day Skin Glow").description("Achieve radiant skin from the inside out with collagen, vitamins, and hydration challenges.")
                        .healthGoal("Skin Health").durationDays(28).difficulty("beginner").gradient("from-pink-500 to-rose-500").icon("Sparkles").participantCount(756).rewardPoints(400).build()
        ));
        log.info("Seeded {} health challenges", challenges.size());
    }

    public List<AIDTO.HealthChallenge> getAllChallenges() {
        return challenges;
    }

    public AIDTO.ChallengeParticipation joinChallenge(Long userId, Long challengeId) {
        String key = userId + "-" + challengeId;
        if (participations.containsKey(key)) {
            return participations.get(key);
        }

        AIDTO.HealthChallenge challenge = challenges.stream()
                .filter(c -> c.getId().equals(challengeId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        AIDTO.ChallengeParticipation participation = AIDTO.ChallengeParticipation.builder()
                .challengeId(challengeId)
                .userId(userId)
                .joinedAt(LocalDateTime.now())
                .currentDay(1)
                .totalPoints(0)
                .completedTasks(0)
                .streak(0)
                .dailyTasks(new ArrayList<>())
                .build();

        // Generate first daily task
        String task = generateDailyTask(challenge, participation, userId);
        participation.setCurrentDailyTask(task);

        participations.put(key, participation);
        challenge.setParticipantCount(challenge.getParticipantCount() + 1);

        return participation;
    }

    public AIDTO.ChallengeParticipation getProgress(Long userId, Long challengeId) {
        String key = userId + "-" + challengeId;
        AIDTO.ChallengeParticipation participation = participations.get(key);
        if (participation == null) return null;

        // Refresh daily task if needed
        AIDTO.HealthChallenge challenge = challenges.stream()
                .filter(c -> c.getId().equals(challengeId)).findFirst().orElse(null);
        if (challenge != null && (participation.getCurrentDailyTask() == null || participation.getCurrentDailyTask().isEmpty())) {
            participation.setCurrentDailyTask(generateDailyTask(challenge, participation, userId));
        }

        return participation;
    }

    public AIDTO.ChallengeParticipation completeTask(Long userId, Long challengeId) {
        String key = userId + "-" + challengeId;
        AIDTO.ChallengeParticipation participation = participations.get(key);
        if (participation == null) throw new RuntimeException("Not participating in this challenge");

        AIDTO.HealthChallenge challenge = challenges.stream()
                .filter(c -> c.getId().equals(challengeId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        // Award points
        int points = 10 + (participation.getStreak() >= 3 ? 5 : 0); // streak bonus
        participation.setTotalPoints(participation.getTotalPoints() + points);
        participation.setCompletedTasks(participation.getCompletedTasks() + 1);
        participation.setStreak(participation.getStreak() + 1);
        participation.setCurrentDay(participation.getCurrentDay() + 1);

        // Track completed task
        if (participation.getDailyTasks() == null) participation.setDailyTasks(new ArrayList<>());
        participation.getDailyTasks().add(participation.getCurrentDailyTask());

        // Check if challenge completed
        boolean completed = participation.getCurrentDay() > challenge.getDurationDays();
        participation.setChallengeCompleted(completed);
        if (completed) {
            participation.setTotalPoints(participation.getTotalPoints() + challenge.getRewardPoints());
        }

        // Generate next task
        if (!completed) {
            participation.setCurrentDailyTask(generateDailyTask(challenge, participation, userId));
        } else {
            participation.setCurrentDailyTask("Challenge complete! You earned " + participation.getTotalPoints() + " points!");
        }

        return participation;
    }

    public List<AIDTO.LeaderboardEntry> getLeaderboard(Long challengeId) {
        return participations.values().stream()
                .filter(p -> p.getChallengeId().equals(challengeId))
                .sorted(Comparator.comparingInt(AIDTO.ChallengeParticipation::getTotalPoints).reversed())
                .limit(20)
                .map(p -> AIDTO.LeaderboardEntry.builder()
                        .userId(p.getUserId())
                        .points(p.getTotalPoints())
                        .streak(p.getStreak())
                        .completedTasks(p.getCompletedTasks())
                        .build())
                .collect(Collectors.toList());
    }

    private String generateDailyTask(AIDTO.HealthChallenge challenge, AIDTO.ChallengeParticipation participation, Long userId) {
        String userContext = "";
        if (userId != null) {
            Optional<UserHealthProfile> profile = healthProfileRepository.findByUserId(userId);
            if (profile.isPresent()) {
                UserHealthProfile p = profile.get();
                userContext = "User age: " + p.getAge() + ", goals: " + p.getHealthGoals();
            }
        }

        String prompt = "Generate ONE specific, actionable daily health task for Day " + participation.getCurrentDay() +
                " of a " + challenge.getDurationDays() + "-day " + challenge.getTitle() + " challenge. " +
                "Health goal: " + challenge.getHealthGoal() + ". " + userContext +
                "\n\nRespond with ONLY the task text (1-2 sentences). No JSON, no quotes. Make it practical and achievable.";

        try {
            return groqService.chat("You are a health challenge task generator. Generate brief, specific daily tasks.", prompt);
        } catch (Exception e) {
            log.warn("Failed to generate task via Groq: {}", e.getMessage());
            return getDefaultTask(challenge.getHealthGoal(), participation.getCurrentDay());
        }
    }

    private String getDefaultTask(String goal, int day) {
        Map<String, List<String>> defaults = Map.of(
                "Immunity", List.of("Take 1000mg Vitamin C with breakfast", "Eat 2 servings of citrus fruits today", "Add garlic and ginger to one meal", "Drink warm lemon water first thing in the morning"),
                "Sleep", List.of("No screens 1 hour before bed tonight", "Take magnesium 30 minutes before bed", "Practice 5-minute deep breathing before sleep", "Keep your bedroom at 65-68°F tonight"),
                "Energy", List.of("Take a B-Complex vitamin with breakfast", "Walk for 15 minutes after lunch", "Drink 8 glasses of water today", "Replace one coffee with green tea"),
                "Joint Health", List.of("Take turmeric with black pepper at dinner", "Do 10 minutes of gentle stretching", "Apply a cold pack to sore joints for 15 min", "Eat omega-3 rich food today (fish, walnuts, flaxseed)"),
                "Stress Relief", List.of("Practice 10 minutes of meditation", "Take ashwagandha with your morning meal", "Go for a 20-minute nature walk", "Write 3 things you're grateful for tonight"),
                "Skin Health", List.of("Drink 10 glasses of water today", "Take a collagen supplement with vitamin C", "Apply SPF 30+ before going outside", "Eat a colorful salad with antioxidant-rich veggies"))
        ;
        List<String> tasks = defaults.getOrDefault(goal, List.of("Focus on your health goal today", "Stay hydrated and eat nutritious food"));
        return tasks.get((day - 1) % tasks.size());
    }
}
