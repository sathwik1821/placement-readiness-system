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
    private AnalysisController analysisController;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        com.placement.system.model.Student student = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String userId = jwtService.extractUserId(token);
                if (userId != null) {
                    student = studentRepository.findByUserId(userId).orElse(null);
                }
            } catch (Exception ignored) {}
        }

        List<TestCategory> categories = categoryRepository.findAll();
        List<Map<String, Object>> res = new ArrayList<>();
        for (TestCategory c : categories) {
            if (student != null) {
                if (c.getIsActive() != null && !c.getIsActive()) {
                    continue;
                }
                // Check target years
                if (c.getTargetYears() != null && !c.getTargetYears().isBlank()) {
                    try {
                        List<Object> years = mapper.readValue(c.getTargetYears(), new TypeReference<List<Object>>() {});
                        if (!years.isEmpty()) {
                            final int sYear = student.getYear() != null ? student.getYear() : 0;
                            boolean match = years.stream().anyMatch(y -> {
                                String yStr = String.valueOf(y).replace("E", "").replace("e", "").trim();
                                try {
                                    return Integer.parseInt(yStr) == sYear;
                                } catch (Exception ex) {
                                    return false;
                                }
                            });
                            if (!match) continue;
                        }
                    } catch (Exception ignored) {}
                }
                // Check target departments
                if (c.getTargetDepartments() != null && !c.getTargetDepartments().isBlank()) {
                    try {
                        List<String> depts = mapper.readValue(c.getTargetDepartments(), new TypeReference<List<String>>() {});
                        if (!depts.isEmpty() && !com.placement.system.util.RguktUtils.isDepartmentEligible(depts, student.getDepartment())) {
                            continue;
                        }
                    } catch (Exception ignored) {}
                }
            }

            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("type", c.getType());
            map.put("domain", c.getDomain());
            map.put("description", c.getDescription());
            map.put("durationMinutes", c.getDurationMinutes() != null ? c.getDurationMinutes() : 30);
            map.put("passingPercentage", c.getPassingPercentage() != null ? c.getPassingPercentage() : 60.0);
            map.put("targetYears", c.getTargetYears());
            map.put("targetDepartments", c.getTargetDepartments());
            map.put("isActive", c.getIsActive() != null ? c.getIsActive() : true);
            map.put("_count", Map.of("questions", questionRepository.countByTestCategoryId(c.getId())));
            res.add(map);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/categories/{id}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable String id) {
        // Stratified sampling: 6 EASY + 8 MEDIUM + 6 HARD = 20 questions
        List<Question> easyQs = questionRepository.findByTestCategoryIdAndDifficulty(id, "EASY");
        List<Question> mediumQs = questionRepository.findByTestCategoryIdAndDifficulty(id, "MEDIUM");
        List<Question> hardQs = questionRepository.findByTestCategoryIdAndDifficulty(id, "HARD");

        Collections.shuffle(easyQs);
        Collections.shuffle(mediumQs);
        Collections.shuffle(hardQs);

        int totalPool = easyQs.size() + mediumQs.size() + hardQs.size();
        int target = Math.min(20, totalPool);

        int wantEasy = 6, wantMedium = 8, wantHard = 6;
        if (totalPool < 20) {
            wantEasy = easyQs.size();
            wantMedium = mediumQs.size();
            wantHard = hardQs.size();
        } else {
            wantEasy = Math.min(wantEasy, easyQs.size());
            wantMedium = Math.min(wantMedium, mediumQs.size());
            wantHard = Math.min(wantHard, hardQs.size());
            int remaining = target - wantEasy - wantMedium - wantHard;
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

        // Fallback if stratified returns empty
        if (selected.isEmpty()) {
            List<Question> allQs = questionRepository.findByTestCategoryId(id);
            Collections.shuffle(allQs);
            selected = allQs.size() > 20 ? new ArrayList<>(allQs.subList(0, 20)) : new ArrayList<>(allQs);
        }

        // Sanitize for test-taker: DO NOT expose correctAnswer or explanation during the live test
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
        com.placement.system.model.Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));

        String catId = body.get("testCategoryId") != null ? body.get("testCategoryId") : body.get("categoryId");
        if (catId == null || catId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "testCategoryId or categoryId is required"));
        }

        TestCategory category = categoryRepository.findById(catId).orElse(null);
        if (category == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Assessment category not found"));
        }

        if (category.getIsActive() != null && !category.getIsActive()) {
            return ResponseEntity.badRequest().body(Map.of("error", "This assessment is currently inactive"));
        }

        // Verify eligibility if targeted
        if (category.getTargetYears() != null && !category.getTargetYears().isBlank()) {
            try {
                List<Object> years = mapper.readValue(category.getTargetYears(), new TypeReference<List<Object>>() {});
                if (!years.isEmpty()) {
                    final int sYear = student.getYear() != null ? student.getYear() : 0;
                    boolean match = years.stream().anyMatch(y -> {
                        String yStr = String.valueOf(y).replace("E", "").replace("e", "").trim();
                        try {
                            return Integer.parseInt(yStr) == sYear;
                        } catch (Exception ex) {
                            return false;
                        }
                    });
                    if (!match) {
                        return ResponseEntity.status(403).body(Map.of("error", "This assessment is restricted to selected academic batches"));
                    }
                }
            } catch (Exception ignored) {}
        }

        if (category.getTargetDepartments() != null && !category.getTargetDepartments().isBlank()) {
            try {
                List<String> depts = mapper.readValue(category.getTargetDepartments(), new TypeReference<List<String>>() {});
                if (!depts.isEmpty() && !com.placement.system.util.RguktUtils.isDepartmentEligible(depts, student.getDepartment())) {
                    return ResponseEntity.status(403).body(Map.of("error", "This assessment is restricted to other academic branches"));
                }
            } catch (Exception ignored) {}
        }

        long qCount = questionRepository.countByTestCategoryId(catId);
        int targetQuestions = (int) Math.min(20, qCount > 0 ? qCount : 20);

        int durationMins = (category.getDurationMinutes() != null && category.getDurationMinutes() > 0)
                ? category.getDurationMinutes() : 30;

        TestAttempt attempt = new TestAttempt();
        attempt.setStudentId(student.getId());
        attempt.setTestCategoryId(catId);
        attempt.setTotalMarks(targetQuestions);
        attempt.setStatus("IN_PROGRESS");
        attempt.setTimeLimitSeconds(durationMins * 60);
        attempt.setStartedAt(LocalDateTime.now());
        attempt = attemptRepository.save(attempt);

        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/attempts/{id}/submit")
    public ResponseEntity<?> submitAttempt(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, List<Map<String, Object>>> body) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.status(403).body(Map.of("error", "Student not found"));

        TestAttempt attempt = attemptRepository.findById(id).orElse(null);
        if (attempt == null) return ResponseEntity.notFound().build();

        if (!attempt.getStudentId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this test attempt"));
        }

        if ("COMPLETED".equals(attempt.getStatus()) || "LATE_SUBMISSION".equals(attempt.getStatus())) {
            // Already submitted, return the full review payload
            return ResponseEntity.ok(buildAttemptReviewPayload(attempt));
        }

        boolean lateSubmission = false;
        if (attempt.getStartedAt() != null) {
            long elapsedSeconds = Duration.between(attempt.getStartedAt(), LocalDateTime.now()).toSeconds();
            int gracePeriod = 300;
            int limit = (attempt.getTimeLimitSeconds() != null ? attempt.getTimeLimitSeconds() : 1800) + gracePeriod;
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
                    boolean isAttempted = selected != null && !selected.trim().isBlank();
                    boolean isCorrect = isAttempted && q.getCorrectAnswer().trim().equalsIgnoreCase(selected.trim());
                    if (isCorrect) {
                        score += q.getMarks();
                        correctCount++;
                    } else if (isAttempted) {
                        score -= q.getNegativeMarks();
                    }

                    TestResponse tr = new TestResponse();
                    tr.setTestAttemptId(attempt.getId());
                    tr.setQuestionId(qId);
                    tr.setSelectedAnswer(selected != null ? selected.trim() : "");
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

        // Return comprehensive test analysis and review
        return ResponseEntity.ok(buildAttemptReviewPayload(attempt));
    }

    @GetMapping("/attempts/{id}/review")
    public ResponseEntity<?> getAttemptReview(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.status(403).body(Map.of("error", "Student not found"));

        TestAttempt attempt = attemptRepository.findById(id).orElse(null);
        if (attempt == null) return ResponseEntity.notFound().build();

        if (!attempt.getStudentId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this test attempt"));
        }

        return ResponseEntity.ok(buildAttemptReviewPayload(attempt));
    }

    private Map<String, Object> buildAttemptReviewPayload(TestAttempt attempt) {
        TestCategory category = categoryRepository.findById(attempt.getTestCategoryId()).orElse(null);
        String categoryName = category != null ? category.getName() : "Assessment";

        List<TestResponse> responses = responseRepository.findByTestAttemptId(attempt.getId());
        List<Map<String, Object>> questionReviews = new ArrayList<>();

        int correctCount = 0;
        int incorrectCount = 0;
        int skippedCount = 0;

        for (TestResponse tr : responses) {
            Question q = questionRepository.findById(tr.getQuestionId()).orElse(null);
            if (q == null) continue;

            boolean isAttempted = tr.getSelectedAnswer() != null && !tr.getSelectedAnswer().isBlank();
            boolean isCorrect = Boolean.TRUE.equals(tr.getIsCorrect());

            if (!isAttempted) {
                skippedCount++;
            } else if (isCorrect) {
                correctCount++;
            } else {
                incorrectCount++;
            }

            Map<String, Object> qr = new LinkedHashMap<>();
            qr.put("questionId", q.getId());
            qr.put("questionText", q.getQuestionText());
            try {
                qr.put("options", mapper.readValue(q.getOptions(), new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                qr.put("options", List.of());
            }
            qr.put("selectedAnswer", tr.getSelectedAnswer());
            qr.put("correctAnswer", q.getCorrectAnswer());
            qr.put("isCorrect", isCorrect);
            qr.put("isAttempted", isAttempted);
            qr.put("explanation", q.getExplanation() != null && !q.getExplanation().isBlank()
                    ? q.getExplanation()
                    : "The correct answer is '" + q.getCorrectAnswer() + "'. Review standard documentation for this topic.");
            qr.put("difficulty", q.getDifficulty());
            qr.put("topic", q.getTopic());
            qr.put("marks", q.getMarks());
            qr.put("negativeMarks", q.getNegativeMarks());
            qr.put("timeTaken", tr.getTimeTaken());

            questionReviews.add(qr);
        }

        int totalQuestions = questionReviews.size();
        if (totalQuestions == 0 && attempt.getTotalMarks() != null) {
            totalQuestions = attempt.getTotalMarks();
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalQuestions", totalQuestions);
        summary.put("correctCount", correctCount);
        summary.put("incorrectCount", incorrectCount);
        summary.put("skippedCount", skippedCount);
        summary.put("totalScore", attempt.getTotalScore());
        summary.put("totalMarks", attempt.getTotalMarks());
        summary.put("percentageScore", attempt.getPercentageScore());
        summary.put("status", attempt.getStatus());
        summary.put("startedAt", attempt.getStartedAt());
        summary.put("completedAt", attempt.getCompletedAt());
        summary.put("categoryName", categoryName);
        summary.put("testCategoryId", attempt.getTestCategoryId());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("attempt", attempt);
        result.put("summary", summary);
        result.put("questions", questionReviews);

        return result;
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
