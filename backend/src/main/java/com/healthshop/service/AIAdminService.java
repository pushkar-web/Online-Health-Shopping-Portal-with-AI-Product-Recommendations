package com.healthshop.service;

import com.healthshop.dto.AIDTO;
import com.healthshop.model.UserHealthProfile;
import com.healthshop.repository.UserHealthProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIAdminService {

    private final UserHealthProfileRepository profileRepository;

    public AIDTO.AdminAIStatsResponse getAdminStats() {
        List<UserHealthProfile> profiles = profileRepository.findAll();

        int totalProfiles = profiles.size();

        // Calculate Average Health Score (Mock logic as actual score is complex)
        // In a real app, we'd store the score in the profile
        double avgScore = profiles.isEmpty() ? 0.0 : 72.5;

        // Aggregate Health Goals
        Map<String, Long> goalCounts = new HashMap<>();
        for (UserHealthProfile p : profiles) {
            if (p.getHealthGoals() != null && !p.getHealthGoals().isEmpty()) {
                for (String goal : p.getHealthGoals().split(",")) {
                    goalCounts.merge(goal.trim(), 1L, (a, b) -> a + b);
                }
            }
        }
        List<AIDTO.LabelValue> topGoals = goalCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new AIDTO.LabelValue(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Aggregate Age Groups
        Map<String, Long> ageGroupCounts = new HashMap<>();
        for (UserHealthProfile p : profiles) {
            if (p.getAgeGroup() != null) {
                ageGroupCounts.merge(p.getAgeGroup().name(), 1L, (a, b) -> a + b);
            }
        }
        List<AIDTO.LabelValue> ageDistribution = ageGroupCounts.entrySet().stream()
                .map(e -> new AIDTO.LabelValue(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Mock Top Symptoms (Since we don't persist chat logs yet)
        List<AIDTO.LabelValue> topSymptoms = List.of(
                new AIDTO.LabelValue("Fatigue/Tiredness", 45L),
                new AIDTO.LabelValue("Sleep Issues", 38L),
                new AIDTO.LabelValue("Stress/Anxiety", 32L),
                new AIDTO.LabelValue("Joint Pain", 28L),
                new AIDTO.LabelValue("Digestive Issues", 25L));

        // Mock Recent Activity
        List<String> recentActivity = List.of(
                "User #1024 checked interactions for Vitamin D + Aspirin",
                "User #1025 requested dosage for Magnesium",
                "User #1028 completed symptom check: 'Headache'",
                "User #1030 updated health profile",
                "AI generated 5 new recommendations for User #1022");

        return AIDTO.AdminAIStatsResponse.builder()
                .totalHealthProfiles(totalProfiles)
                .avgHealthScore(avgScore)
                .topHealthGoals(topGoals)
                .ageGroupDistribution(ageDistribution)
                .topSymptoms(topSymptoms)
                .recentAiActivity(recentActivity)
                .build();
    }
}
