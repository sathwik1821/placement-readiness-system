package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Question;
import com.placement.system.model.TestCategory;
import com.placement.system.model.User;
import com.placement.system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PlacementOfficerRepository officerRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private PlacementApplicationRepository applicationRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private TestCategoryRepository categoryRepository;

    @Autowired
    private TestAttemptRepository attemptRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("students", studentRepository.count());
        stats.put("officers", officerRepository.count());
        stats.put("companies", companyRepository.count());
        stats.put("drives", driveRepository.count());
        stats.put("applications", applicationRepository.count());
        stats.put("questions", questionRepository.count());
        stats.put("categories", categoryRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("createdAt", u.getCreatedAt());

            studentRepository.findByUserId(u.getId()).ifPresent(s -> {
                Map<String, Object> sMap = new HashMap<>();
                sMap.put("name", s.getName());
                sMap.put("department", s.getDepartment());
                sMap.put("year", s.getYear());
                sMap.put("yearOfStudy", s.getYearOfStudy());
                sMap.put("rollNumber", s.getRollNumber());
                sMap.put("college", s.getCollege());
                map.put("student", sMap);
            });
            officerRepository.findByUserId(u.getId()).ifPresent(o -> map.put("placementOfficer", Map.of("name", o.getName(), "department", o.getDepartment())));
            companyRepository.findByUserId(u.getId()).ifPresent(c -> map.put("company", Map.of("companyName", c.getCompanyName(), "industry", c.getIndustry())));

            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ASSESSMENT & ASSIGNMENT MANAGEMENT
    // ==========================================

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
            map.put("durationMinutes", c.getDurationMinutes() != null ? c.getDurationMinutes() : 30);
            map.put("passingPercentage", c.getPassingPercentage() != null ? c.getPassingPercentage() : 60.0);
            map.put("isActive", c.getIsActive() != null ? c.getIsActive() : true);
            map.put("targetYears", c.getTargetYears());
            map.put("targetDepartments", c.getTargetDepartments());
            map.put("createdAt", c.getCreatedAt());

            try {
                map.put("targetYearsList", mapper.readValue(c.getTargetYears() != null ? c.getTargetYears() : "[]", new TypeReference<List<Object>>() {}));
            } catch (Exception e) {
                map.put("targetYearsList", List.of());
            }

            try {
                map.put("targetDepartmentsList", mapper.readValue(c.getTargetDepartments() != null ? c.getTargetDepartments() : "[]", new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                map.put("targetDepartmentsList", List.of());
            }

            long qCount = questionRepository.countByTestCategoryId(c.getId());
            long attemptCount = attemptRepository.countByTestCategoryId(c.getId());
            map.put("_count", Map.of("questions", qCount, "attempts", attemptCount));
            res.add(map);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> body) {
        try {
            TestCategory c = new TestCategory();
            c.setName((String) body.get("name"));
            c.setType((String) body.getOrDefault("type", "TECHNICAL"));
            String domain = (String) body.getOrDefault("domain", body.getOrDefault("department", "All Departments"));
            c.setDomain(domain);
            c.setDescription((String) body.getOrDefault("description", ""));

            // Parse targetYears
            Object yearsObj = body.get("targetYears");
            if (yearsObj instanceof List) {
                c.setTargetYears(mapper.writeValueAsString(yearsObj));
            } else if (yearsObj instanceof String) {
                c.setTargetYears((String) yearsObj);
            } else {
                c.setTargetYears("[]");
            }

            // Parse targetDepartments
            Object deptsObj = body.get("targetDepartments");
            if (deptsObj instanceof List) {
                c.setTargetDepartments(mapper.writeValueAsString(deptsObj));
            } else if (deptsObj instanceof String) {
                c.setTargetDepartments((String) deptsObj);
            } else {
                c.setTargetDepartments("[]");
            }

            if (body.get("durationMinutes") != null) {
                c.setDurationMinutes(Integer.parseInt(body.get("durationMinutes").toString()));
            } else {
                c.setDurationMinutes(30);
            }

            if (body.get("passingPercentage") != null) {
                c.setPassingPercentage(Double.parseDouble(body.get("passingPercentage").toString()));
            } else {
                c.setPassingPercentage(60.0);
            }

            if (body.get("isActive") != null) {
                c.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
            } else {
                c.setIsActive(true);
            }

            c.setCreatedAt(LocalDateTime.now());
            c.setUpdatedAt(LocalDateTime.now());
            c = categoryRepository.save(c);
            return ResponseEntity.ok(c);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            TestCategory c = categoryRepository.findById(id).orElse(null);
            if (c == null) return ResponseEntity.notFound().build();

            if (body.containsKey("name")) c.setName((String) body.get("name"));
            if (body.containsKey("type")) c.setType((String) body.get("type"));
            if (body.containsKey("domain")) c.setDomain((String) body.get("domain"));
            if (body.containsKey("description")) c.setDescription((String) body.get("description"));

            if (body.containsKey("targetYears")) {
                Object yearsObj = body.get("targetYears");
                if (yearsObj instanceof List) {
                    c.setTargetYears(mapper.writeValueAsString(yearsObj));
                } else if (yearsObj instanceof String) {
                    c.setTargetYears((String) yearsObj);
                }
            }

            if (body.containsKey("targetDepartments")) {
                Object deptsObj = body.get("targetDepartments");
                if (deptsObj instanceof List) {
                    c.setTargetDepartments(mapper.writeValueAsString(deptsObj));
                } else if (deptsObj instanceof String) {
                    c.setTargetDepartments((String) deptsObj);
                }
            }

            if (body.containsKey("durationMinutes") && body.get("durationMinutes") != null) {
                c.setDurationMinutes(Integer.parseInt(body.get("durationMinutes").toString()));
            }

            if (body.containsKey("passingPercentage") && body.get("passingPercentage") != null) {
                c.setPassingPercentage(Double.parseDouble(body.get("passingPercentage").toString()));
            }

            if (body.containsKey("isActive") && body.get("isActive") != null) {
                c.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
            }

            c.setUpdatedAt(LocalDateTime.now());
            c = categoryRepository.save(c);
            return ResponseEntity.ok(c);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        try {
            TestCategory c = categoryRepository.findById(id).orElse(null);
            if (c == null) return ResponseEntity.notFound().build();

            // Delete associated questions
            List<Question> qs = questionRepository.findByTestCategoryId(id);
            if (!qs.isEmpty()) {
                questionRepository.deleteAll(qs);
            }

            categoryRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "deletedQuestions", qs.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // QUESTION BANK CURATOR MANAGEMENT
    // ==========================================

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(@RequestParam(required = false) String categoryId) {
        List<Question> questions;
        if (categoryId != null && !categoryId.isBlank() && !"ALL".equalsIgnoreCase(categoryId)) {
            questions = questionRepository.findByTestCategoryId(categoryId);
        } else {
            questions = questionRepository.findAll();
        }

        List<Map<String, Object>> res = new ArrayList<>();
        Map<String, TestCategory> catLookup = new HashMap<>();

        for (Question q : questions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("testCategoryId", q.getTestCategoryId());
            map.put("questionText", q.getQuestionText());
            map.put("correctAnswer", q.getCorrectAnswer());
            map.put("explanation", q.getExplanation() != null ? q.getExplanation() : "");
            map.put("difficulty", q.getDifficulty());
            map.put("topic", q.getTopic());
            map.put("marks", q.getMarks());
            map.put("negativeMarks", q.getNegativeMarks());

            if (!catLookup.containsKey(q.getTestCategoryId())) {
                categoryRepository.findById(q.getTestCategoryId()).ifPresent(cat -> catLookup.put(q.getTestCategoryId(), cat));
            }
            if (catLookup.containsKey(q.getTestCategoryId())) {
                map.put("category", catLookup.get(q.getTestCategoryId()));
            }

            try {
                map.put("options", mapper.readValue(q.getOptions(), new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                map.put("options", List.of());
            }
            res.add(map);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/questions")
    public ResponseEntity<?> createQuestion(@RequestBody Map<String, Object> body) {
        try {
            Question q = new Question();
            String catId = (String) body.get("testCategoryId");
            if (catId == null || catId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "testCategoryId is required"));
            }
            q.setTestCategoryId(catId);
            q.setQuestionText((String) body.get("questionText"));

            Object opts = body.get("options");
            if (opts instanceof List) {
                q.setOptions(mapper.writeValueAsString(opts));
            } else if (opts instanceof String) {
                q.setOptions((String) opts);
            } else {
                q.setOptions("[]");
            }

            q.setCorrectAnswer((String) body.get("correctAnswer"));
            q.setExplanation((String) body.getOrDefault("explanation", ""));
            q.setDifficulty((String) body.getOrDefault("difficulty", "MEDIUM"));
            q.setTopic((String) body.getOrDefault("topic", ""));

            if (body.get("marks") != null) {
                q.setMarks(Integer.parseInt(body.get("marks").toString()));
            }
            if (body.get("negativeMarks") != null) {
                q.setNegativeMarks(Double.parseDouble(body.get("negativeMarks").toString()));
            }

            Question saved = questionRepository.save(q);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            Question q = questionRepository.findById(id).orElse(null);
            if (q == null) return ResponseEntity.notFound().build();

            if (body.containsKey("testCategoryId")) q.setTestCategoryId((String) body.get("testCategoryId"));
            if (body.containsKey("questionText")) q.setQuestionText((String) body.get("questionText"));

            if (body.containsKey("options")) {
                Object opts = body.get("options");
                if (opts instanceof List) {
                    q.setOptions(mapper.writeValueAsString(opts));
                } else if (opts instanceof String) {
                    q.setOptions((String) opts);
                }
            }

            if (body.containsKey("correctAnswer")) q.setCorrectAnswer((String) body.get("correctAnswer"));
            if (body.containsKey("explanation")) q.setExplanation((String) body.get("explanation"));
            if (body.containsKey("difficulty")) q.setDifficulty((String) body.get("difficulty"));
            if (body.containsKey("topic")) q.setTopic((String) body.get("topic"));

            if (body.containsKey("marks") && body.get("marks") != null) {
                q.setMarks(Integer.parseInt(body.get("marks").toString()));
            }
            if (body.containsKey("negativeMarks") && body.get("negativeMarks") != null) {
                q.setNegativeMarks(Double.parseDouble(body.get("negativeMarks").toString()));
            }

            Question saved = questionRepository.save(q);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String id) {
        questionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
