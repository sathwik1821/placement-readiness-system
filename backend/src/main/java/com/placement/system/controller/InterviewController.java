package com.placement.system.controller;

import com.placement.system.service.InterviewService;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/sessions")
    public ResponseEntity<?> startSession(
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey,
            @RequestBody Map<String, String> body) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String role = body.getOrDefault("targetRole", "Java Full Stack Developer");
        String type = body.getOrDefault("interviewType", "TECHNICAL");

        try {
            Map<String, Object> session = interviewService.startSession(userId, role, type, customApiKey);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(interviewService.getStudentSessions(userId));
    }

    @GetMapping("/sessions/{id}/details")
    public ResponseEntity<?> getSessionDetails(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        try {
            return ResponseEntity.ok(interviewService.getSessionDetails(id, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sessions/{id}/answer")
    public ResponseEntity<?> answerQuestion(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey,
            @RequestBody Map<String, String> body) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String questionId = body.get("questionId");
        String text = body.getOrDefault("responseText", "").trim();

        try {
            Map<String, Object> eval = interviewService.answerQuestion(id, userId, questionId, text, customApiKey);
            return ResponseEntity.ok(eval);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sessions/{id}/complete")
    public ResponseEntity<?> completeSession(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        try {
            Map<String, Object> scorecard = interviewService.completeSession(id, userId, customApiKey);
            return ResponseEntity.ok(scorecard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sessions/{id}/discard")
    public ResponseEntity<?> discardSession(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        try {
            interviewService.discardSession(id, userId);
            return ResponseEntity.ok(Map.of("message", "Session discarded"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}
