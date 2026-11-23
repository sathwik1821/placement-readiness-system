package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Question;
import com.placement.system.model.TestAttempt;
import com.placement.system.model.TestCategory;
import com.placement.system.model.TestResponse;
import com.placement.system.repository.QuestionRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.repository.TestAttemptRepository;
import com.placement.system.repository.TestCategoryRepository;
import com.placement.system.repository.TestResponseRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private TestCategoryRepository categoryRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private TestAttemptRepository attemptRepository;

    @Autowired
    private TestResponseRepository responseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        List<TestCategory> categories = categoryRepository.findAll();
        List<Map<String, Object>> res = new ArrayList<>();
        for (TestCategory c : categories) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("type", c.getType());
            map.put("domain", c.getDomain());
            map.put("description", c.getDescription());
            map.put("_count", Map.of("questions", questionRepository.countByTestCategoryId(c.getId())));
            res.add(map);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/categories/{id}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable String id) {
        // Stratified sampling: 3 EASY + 4 MEDIUM + 3 HARD = 10
        List<Question> easyQs = questionRepository.findByTestCategoryIdAndDifficulty(id, "EASY");
        List<Question> mediumQs = questionRepository.findByTestCategoryIdAndDifficulty(id, "MEDIUM");
        List<Question> hardQs = questionRepository.findByTestCategoryIdAndDifficulty(id, "HARD");

        Collections.shuffle(easyQs);
        Collections.shuffle(mediumQs);
        Collections.shuffle(hardQs);

        int totalPool = easyQs.size() + mediumQs.size() + hardQs.size();
        int target = Math.min(10, totalPool);

        // Desired distribution: 3 EASY, 4 MEDIUM, 3 HARD — adjust proportionally if pool is sparse
        int wantEasy = 3, wantMedium = 4, wantHard = 3;
        if (totalPool < 10) {
            // Take whatever is available
            wantEasy = easyQs.size();
            wantMedium = mediumQs.size();
            wantHard = hardQs.size();
        } else {
            // Clamp to available, then fill remaining from other pools
            wantEasy = Math.min(wantEasy, easyQs.size());
            wantMedium = Math.min(wantMedium, mediumQs.size());
            wantHard = Math.min(wantHard, hardQs.size());
            int remaining = target - wantEasy - wantMedium - wantHard;
            // Fill from whichever pools have surplus
            if (remaining > 0 && mediumQs.size() > wantMedium) {
                int extra = Math.min(remaining, mediumQs.size() - wantMedium);
                wantMedium += extra;
                remaining -= extra;
            }
            if (remaining > 0 && easyQs.size() > wantEasy) {
                int extra = Math.min(remaining, easyQs.size() - wantEasy);
                wantEasy += extra;
                remaining -= extra;
            }
            if (remaining > 0 && hardQs.size() > wantHard) {
                int extra = Math.min(remaining, hardQs.size() - wantHard);
                wantHard += extra;
            }
        }

        List<Question> selected = new ArrayList<>();
        selected.addAll(easyQs.subList(0, wantEasy));
        selected.addAll(mediumQs.subList(0, wantMedium));
        selected.addAll(hardQs.subList(0, wantHard));
        Collections.shuffle(selected);

        // If still nothing from stratified (all difficulty fields might be null), fallback to old path
        if (selected.isEmpty()) {
            List<Question> allQs = questionRepository.findByTestCategoryId(id);
            Collections.shuffle(allQs);
            selected = allQs.size() > 10 ? new ArrayList<>(allQs.subList(0, 10)) : new ArrayList<>(allQs);
        }

        List<Map<String, Object>> sanitized = new ArrayList<>();
        for (Question q : selected) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("testCategoryId", q.getTestCategoryId());
            map.put("questionText", q.getQuestionText());
            try {
                map.put("options", mapper.readValue(q.getOptions(), new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                map.put("options", List.of());
            }
            map.put("difficulty", q.getDifficulty());
            map.put("topic", q.getTopic());
            map.put("marks", q.getMarks());
            map.put("negativeMarks", q.getNegativeMarks());
            sanitized.add(map);
        }
        return ResponseEntity.ok(sanitized);
    }

    @PostMapping("/attempts")
    public ResponseEntity<?> startAttempt(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));

        String catId = body.get("testCategoryId");
        long qCount = questionRepository.countByTestCategoryId(catId);
        int targetQuestions = (int) Math.min(10, qCount > 0 ? qCount : 10);

        TestAttempt attempt = new TestAttempt();
        attempt.setStudentId(studentId);
        attempt.setTestCategoryId(catId);
        attempt.setTotalMarks(targetQuestions);
        attempt.setStatus("IN_PROGRESS");
        attempt.setTimeLimitSeconds(1200); // 20 minutes
        attempt = attemptRepository.save(attempt);

        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/attempts/{id}/submit")
    public ResponseEntity<?> submitAttempt(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, List<Map<String, Object>>> body) {

        // IDOR protection: verify attempt belongs to caller
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.status(403).body(Map.of("error", "Student not found"));

        TestAttempt attempt = attemptRepository.findById(id).orElse(null);
        if (attempt == null) return ResponseEntity.notFound().build();

        // Ownership check
        if (!attempt.getStudentId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this test attempt"));
        }

        // Prevent double-submit
        if ("COMPLETED".equals(attempt.getStatus()) || "LATE_SUBMISSION".equals(attempt.getStatus())) {
            return ResponseEntity.status(409).body(Map.of("error", "This attempt has already been submitted"));
        }

        // Server-side timer enforcement (20 min + 5 min grace = 25 min)
        boolean lateSubmission = false;
        if (attempt.getStartedAt() != null) {
            long elapsedSeconds = Duration.between(attempt.getStartedAt(), LocalDateTime.now()).toSeconds();
            int gracePeriod = 300; // 5 minutes grace
            int limit = (attempt.getTimeLimitSeconds() != null ? attempt.getTimeLimitSeconds() : 1200) + gracePeriod;
            if (elapsedSeconds > limit) {
                lateSubmission = true;
            }
        }

        List<Map<String, Object>> responses = body.get("responses");
        double score = 0.0;
        int correctCount = 0;
        int count = 0;

        if (responses != null) {
            for (Map<String, Object> r : responses) {
                String qId = (String) r.get("questionId");
                String selected = (String) r.get("selectedAnswer");
                int timeTaken = r.containsKey("timeTaken") ? ((Number) r.get("timeTaken")).intValue() : 15;

                Question q = questionRepository.findById(qId).orElse(null);
                if (q != null) {
                    boolean isCorrect = q.getCorrectAnswer().trim().equalsIgnoreCase((selected != null ? selected : "").trim());
                    if (isCorrect) {
                        score += q.getMarks();
                        correctCount++;
                    } else if (selected != null && !selected.isBlank()) {
                        score -= q.getNegativeMarks();
                    }

                    TestResponse tr = new TestResponse();
                    tr.setTestAttemptId(attempt.getId());
                    tr.setQuestionId(qId);
                    tr.setSelectedAnswer(selected != null ? selected : "");
                    tr.setIsCorrect(isCorrect);
                    tr.setTimeTaken(timeTaken);
                    responseRepository.save(tr);
                    count++;
                }
            }
        }

        score = Math.max(0.0, Math.round(score * 100.0) / 100.0);
        int totalQuestions = attempt.getTotalMarks() > 0 ? attempt.getTotalMarks() : Math.max(1, count);
        double accuracyPct = Math.min(100.0, Math.max(0.0, Math.round(((double) correctCount / totalQuestions) * 1000.0) / 10.0));

        // Apply 20% penalty for late submissions
        if (lateSubmission) {
            accuracyPct = Math.max(0.0, accuracyPct * 0.80);
            score = Math.max(0.0, score * 0.80);
            attempt.setStatus("LATE_SUBMISSION");
        } else {
            attempt.setStatus("COMPLETED");
        }

        attempt.setTotalScore(score);
        attempt.setPercentageScore(accuracyPct);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt = attemptRepository.save(attempt);

        return ResponseEntity.ok(attempt);
    }

    @GetMapping("/attempts")
    public ResponseEntity<?> getAttempts(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.ok(List.of());

        List<TestAttempt> attempts = attemptRepository.findByStudentIdOrderByStartedAtDesc(studentId);
        for (TestAttempt a : attempts) {
            categoryRepository.findById(a.getTestCategoryId()).ifPresent(c -> a.setCategory(c));
        }
        return ResponseEntity.ok(attempts);
    }
}
