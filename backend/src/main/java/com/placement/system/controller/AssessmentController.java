package com.placement.system.controller;

import com.placement.system.model.TestAttempt;
import com.placement.system.service.AssessmentService;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                userId = jwtService.extractUserId(authHeader.substring(7));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(assessmentService.getCategoriesForStudent(userId));
    }

    @GetMapping("/categories/{id}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable String id) {
        return ResponseEntity.ok(assessmentService.getTestQuestions(id));
    }

    @PostMapping("/attempts")
    public ResponseEntity<?> startAttempt(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String catId = body.get("testCategoryId") != null ? body.get("testCategoryId") : body.get("categoryId");

        if (catId == null || catId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "testCategoryId is required"));
        }

        try {
            TestAttempt attempt = assessmentService.startAttempt(userId, catId);
            return ResponseEntity.ok(attempt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/attempts/{id}/submit")
    public ResponseEntity<?> submitAttempt(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, List<Map<String, Object>>> body) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        List<Map<String, Object>> responses = body.get("responses");

        try {
            Map<String, Object> result = assessmentService.submitAttempt(id, userId, responses);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attempts/{id}/review")
    public ResponseEntity<?> getAttemptReview(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        try {
            Map<String, Object> review = assessmentService.getAttemptReview(id, userId);
            return ResponseEntity.ok(review);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attempts")
    public ResponseEntity<?> getAttempts(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(assessmentService.getCategoriesForStudent(userId));
    }
}
