package com.placement.system.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Question;
import com.placement.system.model.Student;
import com.placement.system.model.TestAttempt;
import com.placement.system.model.TestCategory;
import com.placement.system.model.TestResponse;
import com.placement.system.repository.QuestionRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.repository.TestAttemptRepository;
import com.placement.system.repository.TestCategoryRepository;
import com.placement.system.repository.TestResponseRepository;
import com.placement.system.util.RguktUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class AssessmentService {

    private static final Logger logger = LoggerFactory.getLogger(AssessmentService.class);

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

    private final ObjectMapper mapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCategoriesForStudent(String userId) {
        Student student = userId != null ? studentRepository.findByUserId(userId).orElse(null) : null;
        List<TestCategory> categories = categoryRepository.findAll();
        List<Map<String, Object>> res = new ArrayList<>();

        for (TestCategory c : categories) {
            if (student != null) {
                if (c.getIsActive() != null && !c.getIsActive()) continue;

                // Target Year filter
                if (c.getTargetYears() != null && !c.getTargetYears().isBlank()) {
                    try {
                        List<Object> years = mapper.readValue(c.getTargetYears(), new TypeReference<List<Object>>() {});
                        if (!years.isEmpty()) {
                            final int sYear = student.getYear() != null ? student.getYear() : 0;
                            boolean match = years.stream().anyMatch(y -> {
                                String yStr = String.valueOf(y).replace("E", "").replace("e", "").trim();
                                try { return Integer.parseInt(yStr) == sYear; } catch (Exception ex) { return false; }
                            });
                            if (!match) continue;
                        }
                    } catch (Exception ignored) {}
                }

                // Target Department filter
                if (c.getTargetDepartments() != null && !c.getTargetDepartments().isBlank()) {
                    try {
                        List<String> depts = mapper.readValue(c.getTargetDepartments(), new TypeReference<List<String>>() {});
                        if (!depts.isEmpty() && !RguktUtils.isDepartmentEligible(depts, student.getDepartment())) {
                            continue;
                        }
                    } catch (Exception ignored) {}
                }
            }

            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("type", c.getType() != null ? c.getType() : "TECHNICAL");
            map.put("domain", c.getDomain());
            map.put("department", c.getDomain());
            map.put("description", c.getDescription());
            map.put("durationMinutes", c.getDurationMinutes() != null ? c.getDurationMinutes() : 30);
            map.put("passingPercentage", c.getPassingPercentage() != null ? c.getPassingPercentage() : 60.0);
            map.put("isActive", c.getIsActive() != null ? c.getIsActive() : true);
            map.put("targetDepartments", c.getTargetDepartments());
            map.put("targetYears", c.getTargetYears());
            long qCount = questionRepository.countByTestCategoryId(c.getId());
            map.put("totalQuestions", qCount);
            map.put("_count", Map.of("questions", qCount));
            res.add(map);
        }

        return res;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTestQuestions(String categoryId) {
        List<Question> easyQs = questionRepository.findByTestCategoryIdAndDifficulty(categoryId, "EASY");
        List<Question> mediumQs = questionRepository.findByTestCategoryIdAndDifficulty(categoryId, "MEDIUM");
        List<Question> hardQs = questionRepository.findByTestCategoryIdAndDifficulty(categoryId, "HARD");

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

        if (selected.isEmpty()) {
            List<Question> allQs = questionRepository.findByTestCategoryId(categoryId);
            Collections.shuffle(allQs);
            selected = allQs.size() > 20 ? new ArrayList<>(allQs.subList(0, 20)) : new ArrayList<>(allQs);
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
        return sanitized;
    }

    public TestAttempt startAttempt(String userId, String categoryId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        TestCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment category not found"));

        if (category.getIsActive() != null && !category.getIsActive()) {
            throw new IllegalStateException("This assessment is currently inactive");
        }

        long qCount = questionRepository.countByTestCategoryId(categoryId);
        int targetQuestions = (int) Math.min(20, qCount > 0 ? qCount : 20);
        int durationMins = (category.getDurationMinutes() != null && category.getDurationMinutes() > 0)
                ? category.getDurationMinutes() : 30;

        TestAttempt attempt = new TestAttempt();
        attempt.setStudentId(student.getId());
        attempt.setTestCategoryId(categoryId);
        attempt.setTotalMarks(targetQuestions);
        attempt.setStatus("IN_PROGRESS");
        attempt.setTimeLimitSeconds(durationMins * 60);
        attempt.setStartedAt(LocalDateTime.now());
        return attemptRepository.save(attempt);
    }

    public Map<String, Object> submitAttempt(String attemptId, String userId, List<Map<String, Object>> responses) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        TestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Test attempt not found"));

        if (!attempt.getStudentId().equals(student.getId())) {
            throw new IllegalStateException("You do not own this test attempt");
        }

        if ("COMPLETED".equals(attempt.getStatus()) || "LATE_SUBMISSION".equals(attempt.getStatus())) {
            return buildAttemptReviewPayload(attempt);
        }

        boolean lateSubmission = false;
        if (attempt.getStartedAt() != null) {
            long elapsedSeconds = Duration.between(attempt.getStartedAt(), LocalDateTime.now()).toSeconds();
            int gracePeriod = 300;
            int limit = (attempt.getTimeLimitSeconds() != null ? attempt.getTimeLimitSeconds() : 1800) + gracePeriod;
            if (elapsedSeconds > limit) lateSubmission = true;
        }

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
        }

        attempt.setTotalScore(score);
        attempt.setPercentageScore(accuracyPct);
        attempt.setStatus(lateSubmission ? "LATE_SUBMISSION" : "COMPLETED");
        attempt.setCompletedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        return buildAttemptReviewPayload(attempt);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttemptReview(String attemptId, String userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        TestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Test attempt not found"));

        if (!attempt.getStudentId().equals(student.getId())) {
            throw new IllegalStateException("You do not own this test attempt");
        }

        return buildAttemptReviewPayload(attempt);
    }

    public Map<String, Object> buildAttemptReviewPayload(TestAttempt attempt) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("attemptId", attempt.getId());
        payload.put("testCategoryId", attempt.getTestCategoryId());
        payload.put("score", attempt.getTotalScore());
        payload.put("percentageScore", attempt.getPercentageScore());
        payload.put("status", attempt.getStatus());
        payload.put("startedAt", attempt.getStartedAt());
        payload.put("completedAt", attempt.getCompletedAt());

        categoryRepository.findById(attempt.getTestCategoryId()).ifPresent(cat -> {
            payload.put("categoryName", cat.getName());
            payload.put("categoryDescription", cat.getDescription());
        });

        List<TestResponse> responses = responseRepository.findByTestAttemptId(attempt.getId());
        List<Map<String, Object>> responseDetails = new ArrayList<>();
        int correctCount = 0;
        int wrongCount = 0;
        int unattemptedCount = 0;

        for (TestResponse tr : responses) {
            Map<String, Object> rMap = new HashMap<>();
            rMap.put("responseId", tr.getId());
            rMap.put("questionId", tr.getQuestionId());
            rMap.put("selectedAnswer", tr.getSelectedAnswer());
            rMap.put("isCorrect", tr.getIsCorrect());
            rMap.put("timeTaken", tr.getTimeTaken());

            Question q = questionRepository.findById(tr.getQuestionId()).orElse(null);
            if (q != null) {
                rMap.put("questionText", q.getQuestionText());
                rMap.put("correctAnswer", q.getCorrectAnswer());
                rMap.put("difficulty", q.getDifficulty());
                rMap.put("topic", q.getTopic());
                rMap.put("explanation", q.getExplanation());
                try {
                    rMap.put("options", mapper.readValue(q.getOptions(), new TypeReference<List<String>>() {}));
                } catch (Exception e) {
                    rMap.put("options", List.of());
                }
            }

            if (tr.getIsCorrect() != null && tr.getIsCorrect()) correctCount++;
            else if (tr.getSelectedAnswer() != null && !tr.getSelectedAnswer().isBlank()) wrongCount++;
            else unattemptedCount++;

            responseDetails.add(rMap);
        }

        payload.put("responses", responseDetails);
        payload.put("correctCount", correctCount);
        payload.put("wrongCount", wrongCount);
        payload.put("unattemptedCount", unattemptedCount);
        payload.put("totalQuestions", responses.size());
        return payload;
    }
}
