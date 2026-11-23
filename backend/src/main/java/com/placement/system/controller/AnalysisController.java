package com.placement.system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.*;
import com.placement.system.repository.*;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @Autowired
    private AnalysisReportRepository reportRepository;

    @Autowired
    private LearningRecommendationRepository recommendationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private TestAttemptRepository attemptRepository;

    @Autowired
    private TestCategoryRepository categoryRepository;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/report")
    public ResponseEntity<?> getLatestReport(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.notFound().build();

        AnalysisReport report = reportRepository.findFirstByStudentIdOrderByGeneratedAtDesc(student.getId())
                .orElseGet(() -> generateReportInternal(student));

        report.setRecommendations(recommendationRepository.findByAnalysisReportId(report.getId()));
        return ResponseEntity.ok(report);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.notFound().build();

        AnalysisReport report = generateReportInternal(student);
        report.setRecommendations(recommendationRepository.findByAnalysisReportId(report.getId()));
        return ResponseEntity.ok(report);
    }

    private AnalysisReport generateReportInternal(Student student) {
        CareerGoal goal = careerGoalRepository.findByStudentId(student.getId()).orElse(null);
        String targetRole = goal != null && goal.getTargetRole() != null ? goal.getTargetRole() : "Java Full Stack Developer";

        List<TestAttempt> completed = attemptRepository.findByStudentIdAndStatusOrderByCompletedAtDesc(student.getId(), "COMPLETED");
        Map<String, Double> categoryScores = new HashMap<>();

        for (TestAttempt a : completed) {
            categoryRepository.findById(a.getTestCategoryId()).ifPresent(cat -> {
                categoryScores.putIfAbsent(cat.getName(), a.getPercentageScore());
            });
        }

        Map<String, Double> weights = getRoleWeights(targetRole);
        Map<String, Integer> benchmarks = getRoleBenchmarks(targetRole);

        double weightedSum = 0.0;
        double totalWeight = 0.0;
        Map<String, Object> breakdown = new HashMap<>();

        for (Map.Entry<String, Double> entry : weights.entrySet()) {
            String cat = entry.getKey();
            double w = entry.getValue();
            boolean attempted = categoryScores.containsKey(cat);
            double sc = categoryScores.getOrDefault(cat, 0.0);
            if (attempted) {
                weightedSum += sc * w;
                totalWeight += w;
            }
            breakdown.put(cat, Map.of("score", Math.round(sc), "weight", w, "attempted", attempted));
        }

        double cgpaFactor = Math.min(100.0, Math.max(0.0, (student.getCgpa() / 10.0) * 100.0));
        weightedSum += cgpaFactor * 0.15;
        totalWeight += 0.15;
        breakdown.put("Academic Standing (CGPA)", Map.of("score", Math.round(cgpaFactor), "weight", 0.15, "attempted", true));

        double readinessScore = Math.min(100.0, Math.max(10.0, Math.round(weightedSum / totalWeight)));

        List<Map<String, Object>> strengths = new ArrayList<>();
        List<Map<String, Object>> skillGaps = new ArrayList<>();

        for (Map.Entry<String, Integer> b : benchmarks.entrySet()) {
            String skill = b.getKey();
            int benchmark = b.getValue();
            double sc = categoryScores.getOrDefault(skill, 0.0);
            if (sc >= benchmark) {
                strengths.add(Map.of("skill", skill, "score", Math.round(sc), "level", sc >= 85 ? "Mastery" : "Proficient"));
            } else {
                double deficit = benchmark - sc;
                skillGaps.add(Map.of(
                    "skill", skill,
                    "observed", Math.round(sc),
                    "required", benchmark,
                    "deficit", Math.round(deficit),
                    "priority", deficit >= 20 ? "HIGH" : deficit >= 10 ? "MEDIUM" : "LOW"
                ));
            }
        }

        skillGaps.sort((a, b) -> ((Number) b.get("deficit")).intValue() - ((Number) a.get("deficit")).intValue());

        String aiFeedback = "Your calculated Placement Readiness Score is " + Math.round(readinessScore) + "/100 for " + targetRole + ". ";
        if (!strengths.isEmpty()) {
            aiFeedback += "You demonstrate verified strength in " + strengths.get(0).get("skill") + ". ";
        }
        if (!skillGaps.isEmpty()) {
            Map<String, Object> top = skillGaps.get(0);
            aiFeedback += "Prioritize remedial modules in " + top.get("skill") + " (" + top.get("observed") + "% observed vs " + top.get("required") + "% expected threshold).";
        } else {
            aiFeedback += "Your competencies are balanced across primary hiring benchmarks.";
        }

        try {
            AnalysisReport r = new AnalysisReport();
            r.setStudentId(student.getId());
            r.setReadinessScore(readinessScore);
            r.setReadinessBreakdown(mapper.writeValueAsString(breakdown));
            r.setStrengths(mapper.writeValueAsString(strengths));
            r.setSkillGaps(mapper.writeValueAsString(skillGaps));
            r.setAiFeedback(aiFeedback);
            r = reportRepository.save(r);

            // Add recommendations
            for (int i = 0; i < Math.min(3, skillGaps.size()); i++) {
                String gapName = (String) skillGaps.get(i).get("skill");
                String prio = (String) skillGaps.get(i).get("priority");
                recommendationRepository.save(new LearningRecommendation(
                    r.getId(), gapName, "PRACTICE", gapName + " Curated Mastery Modules", "https://leetcode.com", prio
                ));
            }
            return r;
        } catch (Exception e) {
            throw new RuntimeException("Error synthesizing analysis report", e);
        }
    }

    private Map<String, Double> getRoleWeights(String role) {
        String normalized = role != null ? role.trim() : "Java Full Stack Developer";
        if (normalized.contains("MERN") || normalized.equalsIgnoreCase("MERN Full Stack Developer")) {
            return Map.of(
                "Web Frontend & React", 0.25,
                "Node.js & Backend Architecture", 0.20,
                "DBMS", 0.15,
                "Data Structures & Algorithms", 0.15,
                "OOP Concepts", 0.10,
                "Logical Reasoning", 0.15
            );
        } else if (normalized.contains("AI") || normalized.contains("ML") || normalized.equalsIgnoreCase("AI / ML Engineer")) {
            return Map.of(
                "Machine Learning & Python", 0.30,
                "Data Structures & Algorithms", 0.20,
                "Quantitative Aptitude", 0.20,
                "DBMS", 0.15,
                "Logical Reasoning", 0.15
            );
        } else if (normalized.contains("Data Analyst") || normalized.equalsIgnoreCase("Data Analyst")) {
            return Map.of(
                "Data Analytics & BI (SQL/Tableau)", 0.25,
                "DBMS", 0.25,
                "Quantitative Aptitude", 0.20,
                "Logical Reasoning", 0.15,
                "Verbal Ability", 0.15
            );
        } else {
            // Default: Java Full Stack Developer
            return Map.of(
                "Java & Spring Boot", 0.20,
                "Data Structures & Algorithms", 0.15,
                "DBMS", 0.15,
                "Web Frontend & React", 0.15,
                "OOP Concepts", 0.10,
                "Quantitative Aptitude", 0.10,
                "Logical Reasoning", 0.10
            );
        }
    }

    private Map<String, Integer> getRoleBenchmarks(String role) {
        String normalized = role != null ? role.trim() : "Java Full Stack Developer";
        if (normalized.contains("MERN") || normalized.equalsIgnoreCase("MERN Full Stack Developer")) {
            return Map.of(
                "Web Frontend & React", 85,
                "Node.js & Backend Architecture", 80,
                "DBMS", 75,
                "Data Structures & Algorithms", 70,
                "OOP Concepts", 75,
                "Logical Reasoning", 70
            );
        } else if (normalized.contains("AI") || normalized.contains("ML") || normalized.equalsIgnoreCase("AI / ML Engineer")) {
            return Map.of(
                "Machine Learning & Python", 85,
                "Data Structures & Algorithms", 75,
                "Quantitative Aptitude", 80,
                "DBMS", 70,
                "Logical Reasoning", 75
            );
        } else if (normalized.contains("Data Analyst") || normalized.equalsIgnoreCase("Data Analyst")) {
            return Map.of(
                "Data Analytics & BI (SQL/Tableau)", 85,
                "DBMS", 80,
                "Quantitative Aptitude", 75,
                "Logical Reasoning", 75,
                "Verbal Ability", 70
            );
        } else {
            // Default: Java Full Stack Developer
            return Map.of(
                "Java & Spring Boot", 80,
                "Data Structures & Algorithms", 75,
                "DBMS", 75,
                "Web Frontend & React", 70,
                "OOP Concepts", 75,
                "Quantitative Aptitude", 70,
                "Logical Reasoning", 70
            );
        }
    }
}
