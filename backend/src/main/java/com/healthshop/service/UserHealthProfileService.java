package com.healthshop.service;

import com.healthshop.dto.RecommendationDTO;
import com.healthshop.model.*;
import com.healthshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserHealthProfileService {

    private final UserHealthProfileRepository profileRepository;
    private final UserRepository userRepository;

    public RecommendationDTO.HealthProfileRequest getProfile(Long userId) {
        UserHealthProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            return new RecommendationDTO.HealthProfileRequest();
        }
        return RecommendationDTO.HealthProfileRequest.builder()
                .age(profile.getAge())
                .gender(profile.getGender())
                .height(profile.getHeight())
                .weight(profile.getWeight())
                .healthGoals(profile.getHealthGoals() != null ? Arrays.asList(profile.getHealthGoals().split(","))
                        : List.of())
                .allergies(
                        profile.getAllergies() != null ? Arrays.asList(profile.getAllergies().split(",")) : List.of())
                .dietaryPreferences(profile.getDietaryPreferences() != null
                        ? Arrays.asList(profile.getDietaryPreferences().split(","))
                        : List.of())
                .medicalConditions(profile.getMedicalConditions() != null
                        ? Arrays.asList(profile.getMedicalConditions().split(","))
                        : List.of())
                .ageGroup(profile.getAgeGroup() != null ? profile.getAgeGroup().name() : null)
                .build();
    }

    public RecommendationDTO.HealthProfileRequest updateProfile(Long userId,
            RecommendationDTO.HealthProfileRequest request) {
        System.out.println("ANTIGRAVITY DEBUG: Service updateProfile called for userId: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserHealthProfile profile = profileRepository.findByUserId(userId)
                .orElse(UserHealthProfile.builder().user(user).build());
        System.out.println("ANTIGRAVITY DEBUG: Profile found/created. ID: " + profile.getId());

        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setHeight(request.getHeight());
        profile.setWeight(request.getWeight());
        profile.setHealthGoals(request.getHealthGoals() != null ? String.join(",", request.getHealthGoals()) : null);
        profile.setAllergies(request.getAllergies() != null ? String.join(",", request.getAllergies()) : null);
        profile.setDietaryPreferences(
                request.getDietaryPreferences() != null ? String.join(",", request.getDietaryPreferences()) : null);
        profile.setMedicalConditions(
                request.getMedicalConditions() != null ? String.join(",", request.getMedicalConditions()) : null);

        if (request.getAgeGroup() != null) {
            profile.setAgeGroup(UserHealthProfile.AgeGroup.valueOf(request.getAgeGroup()));
        } else if (request.getAge() != null) {
            profile.setAgeGroup(determineAgeGroup(request.getAge()));
        }

        profileRepository.save(profile);
        return request;
    }

    private UserHealthProfile.AgeGroup determineAgeGroup(int age) {
        if (age < 18)
            return UserHealthProfile.AgeGroup.TEEN;
        if (age < 30)
            return UserHealthProfile.AgeGroup.YOUNG_ADULT;
        if (age < 45)
            return UserHealthProfile.AgeGroup.ADULT;
        if (age < 60)
            return UserHealthProfile.AgeGroup.MIDDLE_AGED;
        return UserHealthProfile.AgeGroup.SENIOR;
    }
}
