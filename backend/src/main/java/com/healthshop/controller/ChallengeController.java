package com.healthshop.controller;

import com.healthshop.ai.ChallengeService;
import com.healthshop.dto.AIDTO;
import com.healthshop.model.User;
import com.healthshop.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
@Tag(name = "Health Challenges", description = "Gamified community health challenges with AI-personalized daily tasks")
public class ChallengeController {

    private final ChallengeService challengeService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all active health challenges")
    public ResponseEntity<List<AIDTO.HealthChallenge>> getAllChallenges() {
        return ResponseEntity.ok(challengeService.getAllChallenges());
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join a health challenge")
    public ResponseEntity<AIDTO.ChallengeParticipation> joinChallenge(
            @PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(challengeService.joinChallenge(userId, id));
    }

    @GetMapping("/{id}/my-progress")
    @Operation(summary = "Get your progress in a challenge including today's task")
    public ResponseEntity<AIDTO.ChallengeParticipation> getProgress(
            @PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth);
        AIDTO.ChallengeParticipation progress = challengeService.getProgress(userId, id);
        if (progress == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/{id}/complete-task")
    @Operation(summary = "Mark today's task as completed and get next task")
    public ResponseEntity<AIDTO.ChallengeParticipation> completeTask(
            @PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(challengeService.completeTask(userId, id));
    }

    @GetMapping("/{id}/leaderboard")
    @Operation(summary = "Get challenge leaderboard")
    public ResponseEntity<List<AIDTO.LeaderboardEntry>> getLeaderboard(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getLeaderboard(id));
    }

    private Long getUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
