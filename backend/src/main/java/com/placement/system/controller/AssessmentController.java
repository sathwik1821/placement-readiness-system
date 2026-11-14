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
        List<Question> questions = questionRepository.findByTestCategoryId(id);
        List<Map<String, Object>> sanitized = new ArrayList<>();
        for (Question q : questions) {
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
        Collections.shuffle(sanitized);
        return ResponseEntity.ok(sanitized);
    }

    @PostMapping("/attempts")
    public ResponseEntity<?> startAttempt(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));

        String catId = body.get("testCategoryId");
        long qCount = questionRepository.countByTestCategoryId(catId);

        TestAttempt attempt = new TestAttempt();
        attempt.setStudentId(studentId);
        attempt.setTestCategoryId(catId);
        attempt.setTotalMarks((int) (qCount > 0 ? qCount : 10));
        attempt.setStatus("IN_PROGRESS");
        attempt = attemptRepository.save(attempt);

        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/attempts/{id}/submit")
    public ResponseEntity<?> submitAttempt(@PathVariable String id, @RequestBody Map<String, List<Map<String, Object>>> body) {
        TestAttempt attempt = attemptRepository.findById(id).orElse(null);
        if (attempt == null) return ResponseEntity.notFound().build();

        List<Map<String, Object>> responses = body.get("responses");
        double score = 0.0;
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
        int totalMarks = attempt.getTotalMarks() > 0 ? attempt.getTotalMarks() : Math.max(1, count);
        double pct = Math.min(100.0, Math.max(0.0, Math.round((score / totalMarks) * 1000.0) / 10.0));

        attempt.setTotalScore(score);
        attempt.setPercentageScore(pct);
        attempt.setStatus("COMPLETED");
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
