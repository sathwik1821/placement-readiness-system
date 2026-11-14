package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Question;
import com.placement.system.model.User;
import com.placement.system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

            studentRepository.findByUserId(u.getId()).ifPresent(s -> map.put("student", Map.of("name", s.getName(), "department", s.getDepartment())));
            officerRepository.findByUserId(u.getId()).ifPresent(o -> map.put("placementOfficer", Map.of("name", o.getName())));
            companyRepository.findByUserId(u.getId()).ifPresent(c -> map.put("company", Map.of("companyName", c.getCompanyName())));

            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions() {
        List<Question> questions = questionRepository.findAll();
        List<Map<String, Object>> res = new ArrayList<>();

        for (Question q : questions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("questionText", q.getQuestionText());
            map.put("correctAnswer", q.getCorrectAnswer());
            map.put("difficulty", q.getDifficulty());
            map.put("topic", q.getTopic());
            map.put("marks", q.getMarks());
            map.put("negativeMarks", q.getNegativeMarks());

            categoryRepository.findById(q.getTestCategoryId()).ifPresent(c -> map.put("category", c));
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
            q.setTestCategoryId((String) body.get("testCategoryId"));
            q.setQuestionText((String) body.get("questionText"));
            Object opts = body.get("options");
            if (opts instanceof List) {
                q.setOptions(mapper.writeValueAsString(opts));
            } else if (opts instanceof String) {
                q.setOptions((String) opts);
            }
            q.setCorrectAnswer((String) body.get("correctAnswer"));
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

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> body) {
        try {
            com.placement.system.model.TestCategory c = new com.placement.system.model.TestCategory();
            c.setName((String) body.get("name"));
            c.setType((String) body.getOrDefault("type", "TECHNICAL"));
            String domain = (String) body.getOrDefault("domain", body.getOrDefault("department", "All Departments"));
            c.setDomain(domain);
            c.setDescription((String) body.getOrDefault("description", ""));
            c = categoryRepository.save(c);
            return ResponseEntity.ok(c);
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
