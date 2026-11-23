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

        CareerGoal goal = careerGoalRepository.findByStudentId(student.getId()).orElse(null);
        String currentRole = goal != null && goal.getTargetRole() != null ? goal.getTargetRole() : "Java Full Stack Developer";

        // Fetch latest report
        AnalysisReport report = reportRepository.findFirstByStudentIdOrderByGeneratedAtDesc(student.getId()).orElse(null);

        // If no report exists or the career goal has changed, generate a fresh report
        if (report == null || report.getTargetRole() == null || !report.getTargetRole().equalsIgnoreCase(currentRole)) {
            report = generateReportInternal(student);
        }

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
        String targetRole = (goal != null && goal.getTargetRole() != null && !goal.getTargetRole().isBlank())
                ? goal.getTargetRole().trim()
                : "Java Full Stack Developer";

        List<TestAttempt> completed = attemptRepository.findByStudentIdAndStatusOrderByCompletedAtDesc(student.getId(), "COMPLETED");
        Map<String, Double> categoryScores = new HashMap<>();

        // Keep highest percentage score achieved per category
        for (TestAttempt a : completed) {
            categoryRepository.findById(a.getTestCategoryId()).ifPresent(cat -> {
                double current = categoryScores.getOrDefault(cat.getName(), 0.0);
                if (a.getPercentageScore() > current) {
                    categoryScores.put(cat.getName(), a.getPercentageScore());
                }
            });
        }

        Map<String, Double> weights = getRoleWeights(targetRole);
        Map<String, Integer> benchmarks = getRoleBenchmarks(targetRole);

        double weightedSum = 0.0;
        double totalWeight = 0.0;
        Map<String, Object> breakdown = new LinkedHashMap<>();

        for (Map.Entry<String, Double> entry : weights.entrySet()) {
            String cat = entry.getKey();
            double w = entry.getValue();
            boolean attempted = categoryScores.containsKey(cat);
            double sc = categoryScores.getOrDefault(cat, 0.0);

            if (attempted) {
                weightedSum += sc * w;
            }
            totalWeight += w;

            breakdown.put(cat, Map.of(
                "score", Math.round(sc),
                "weight", w,
                "attempted", attempted,
                "benchmark", benchmarks.getOrDefault(cat, 70)
            ));
        }

        // Academic Factor (CGPA / 10 converted to 100-scale)
        double cgpaFactor = Math.min(100.0, Math.max(0.0, (student.getCgpa() / 10.0) * 100.0));
        weightedSum += cgpaFactor * 0.15;
        totalWeight += 0.15;
        breakdown.put("Academic Standing (CGPA)", Map.of(
            "score", Math.round(cgpaFactor),
            "weight", 0.15,
            "attempted", true,
            "benchmark", 70
        ));

        double readinessScore = totalWeight > 0
                ? Math.min(100.0, Math.max(10.0, Math.round(weightedSum / totalWeight)))
                : 50.0;

        List<Map<String, Object>> strengths = new ArrayList<>();
        List<Map<String, Object>> skillGaps = new ArrayList<>();

        for (Map.Entry<String, Integer> b : benchmarks.entrySet()) {
            String skill = b.getKey();
            int benchmark = b.getValue();
            boolean attempted = categoryScores.containsKey(skill);
            double sc = categoryScores.getOrDefault(skill, 0.0);

            if (attempted && sc >= benchmark) {
                strengths.add(Map.of(
                    "skill", skill,
                    "score", Math.round(sc),
                    "benchmark", benchmark,
                    "level", sc >= 85 ? "Mastery" : "Proficient",
                    "description", "Demonstrates verified competence meeting or exceeding the " + targetRole + " benchmark threshold."
                ));
            } else {
                double deficit = benchmark - sc;
                String priority;
                if (!attempted) {
                    priority = "CRITICAL";
                } else if (deficit >= 20 || sc < 50) {
                    priority = "HIGH";
                } else if (deficit >= 10) {
                    priority = "MEDIUM";
                } else {
                    priority = "LOW";
                }

                String laggingReason = getDynamicLaggingReason(skill, targetRole, sc, benchmark, attempted);
                String actionPlan = getDynamicActionPlan(skill, targetRole, attempted);

                skillGaps.add(Map.of(
                    "skill", skill,
                    "observed", Math.round(sc),
                    "required", benchmark,
                    "deficit", Math.round(deficit),
                    "priority", priority,
                    "attempted", attempted,
                    "laggingReason", laggingReason,
                    "actionPlan", actionPlan
                ));
            }
        }

        // Sort skill gaps: CRITICAL first, then by deficit descending
        skillGaps.sort((a, b) -> {
            int p1 = "CRITICAL".equals(a.get("priority")) ? 3 : "HIGH".equals(a.get("priority")) ? 2 : "MEDIUM".equals(a.get("priority")) ? 1 : 0;
            int p2 = "CRITICAL".equals(b.get("priority")) ? 3 : "HIGH".equals(b.get("priority")) ? 2 : "MEDIUM".equals(b.get("priority")) ? 1 : 0;
            if (p1 != p2) return p2 - p1;
            return ((Number) b.get("deficit")).intValue() - ((Number) a.get("deficit")).intValue();
        });

        // AI Feedback generation
        StringBuilder aiFeedback = new StringBuilder();
        aiFeedback.append("Your calculated Placement Readiness Index is ")
                .append(Math.round(readinessScore))
                .append("/100 calibrated for ").append(targetRole).append(". ");

        if (!strengths.isEmpty()) {
            aiFeedback.append("Key verified strength: ").append(strengths.get(0).get("skill"))
                    .append(" (").append(strengths.get(0).get("score")).append("%). ");
        }

        if (!skillGaps.isEmpty()) {
            Map<String, Object> topGap = skillGaps.get(0);
            boolean att = (boolean) topGap.get("attempted");
            if (!att) {
                aiFeedback.append("Primary bottleneck: Core domain competency '").append(topGap.get("skill"))
                        .append("' is unattempted. Complete this diagnostic to enable full recruiter calibration.");
            } else {
                aiFeedback.append("Primary lagging aspect: In '").append(topGap.get("skill"))
                        .append("', observed performance is ").append(topGap.get("observed"))
                        .append("% vs the required ").append(topGap.get("required"))
                        .append("% benchmark for ").append(targetRole).append(". ")
                        .append(topGap.get("laggingReason"));
            }
        } else {
            aiFeedback.append("Your assessment performance satisfies all core technical benchmarks for campus recruitment.");
        }

        try {
            AnalysisReport r = reportRepository.findFirstByStudentIdOrderByGeneratedAtDesc(student.getId())
                    .orElse(new AnalysisReport());

            r.setStudentId(student.getId());
            r.setTargetRole(targetRole);
            r.setReadinessScore(readinessScore);
            r.setReadinessBreakdown(mapper.writeValueAsString(breakdown));
            r.setStrengths(mapper.writeValueAsString(strengths));
            r.setSkillGaps(mapper.writeValueAsString(skillGaps));
            r.setAiFeedback(aiFeedback.toString());
            r.setGeneratedAt(LocalDateTime.now());
            r = reportRepository.save(r);

            // Clean previous recommendations for this report
            recommendationRepository.deleteByAnalysisReportId(r.getId());

            // Dynamically populate comprehensive learning curriculum covering all competencies required for target career
            List<LearningRecommendation> recsToSave = new ArrayList<>();
            Set<String> processedSkills = new LinkedHashSet<>();

            // 1. Add all priority growth areas / skill gaps first (ordered by criticality)
            for (Map<String, Object> gap : skillGaps) {
                String gapName = (String) gap.get("skill");
                String prio = (String) gap.get("priority");
                processedSkills.add(gapName);
                List<LearningResourceDef> defs = getCuratedResourcesForSkill(gapName, targetRole);
                for (LearningResourceDef def : defs) {
                    recsToSave.add(new LearningRecommendation(
                        r.getId(),
                        gapName,
                        def.type,
                        def.title,
                        def.url,
                        prio
                    ));
                }
            }

            // 2. Add all remaining competencies required for this role (satisfying benchmarks) for full career coverage
            for (String roleSkill : benchmarks.keySet()) {
                if (!processedSkills.contains(roleSkill)) {
                    processedSkills.add(roleSkill);
                    List<LearningResourceDef> defs = getCuratedResourcesForSkill(roleSkill, targetRole);
                    for (LearningResourceDef def : defs) {
                        recsToSave.add(new LearningRecommendation(
                            r.getId(),
                            roleSkill,
                            def.type,
                            def.title,
                            def.url,
                            "MASTERY"
                        ));
                    }
                }
            }

            if (!recsToSave.isEmpty()) {
                recommendationRepository.saveAll(recsToSave);
            }

            return r;
        } catch (Exception e) {
            throw new RuntimeException("Error synthesizing dynamic analysis report", e);
        }
    }

    private String getDynamicLaggingReason(String skill, String role, double observed, int benchmark, boolean attempted) {
        if (!attempted) {
            return "No verified assessment score recorded. For " + role + ", recruiters require verified assessment metrics in " + skill + " before scheduling technical interviews.";
        }
        switch (skill) {
            case "Java & Spring Boot":
                return "Spring Boot dependency injection, JPA/Hibernate mappings, and REST architectural patterns are central to enterprise Java hiring. A deficit of " + (int)(benchmark - observed) + "% indicates vulnerability in technical screening rounds.";
            case "Data Structures & Algorithms":
                return "DSA is the mandatory elimination round for campus hiring. Scoring " + (int)observed + "% indicates the need to solidify problem-solving in Trees, Graphs, Sorting, and Dynamic Programming.";
            case "DBMS":
                return "Relational database schema design, indexing, and complex SQL joins are heavily scrutinized for " + role + ". Lagging here impacts ability to answer backend data persistence questions.";
            case "Web Frontend & React":
                return "Modern frontend expectations require mastery of React 18 hooks, state management, and component lifecycles. Your observed score is below the " + benchmark + "% target.";
            case "Node.js & Backend Architecture":
                return "Asynchronous event-loop mechanics, Express middleware, and MongoDB data modeling are foundational for MERN developers. An observed deficit creates barriers in full-stack evaluation.";
            case "Machine Learning & Python":
                return "Supervised algorithms, model evaluation metrics (F1/ROC-AUC), and vectorized computation in NumPy/Pandas are primary filters for AI/ML roles.";
            case "Data Analytics & BI (SQL/Tableau)":
                return "Window functions, aggregate KPIs, and data transformation logic are core requirements for analytics candidates.";
            case "OOP Concepts":
                return "SOLID design principles, polymorphism, and encapsulation are rigorously tested in round 1 and 2 technical interviews.";
            case "Quantitative Aptitude":
                return "Initial campus placement screening tests use speed-distance-time, probability, and percentages as qualifying gatekeepers.";
            case "Logical Reasoning":
                return "Pattern deduction, sequence analysis, and critical reasoning determine qualifying cutoffs in campus aptitude assessments.";
            case "Computer Networks":
                return "TCP/IP layers, HTTP/HTTPS security, DNS resolution, and RESTful transport protocols are core systems topics tested by recruiters.";
            case "Operating Systems":
                return "Virtual memory management, process synchronization, threading, and deadlocks are fundamental systems questions asked in tech interviews.";
            default:
                return "Current performance in " + skill + " is below the " + benchmark + "% threshold expected for " + role + " campus selections.";
        }
    }

    private String getDynamicActionPlan(String skill, String role, boolean attempted) {
        if (!attempted) {
            return "Attempt the " + skill + " assessment module immediately to establish your baseline benchmark.";
        }
        switch (skill) {
            case "Java & Spring Boot":
                return "Build a modular REST API with Spring Data JPA and practice annotations (@Autowired, @Transactional, @RestController).";
            case "Data Structures & Algorithms":
                return "Complete 3 medium-difficulty problems daily on NeetCode 150 covering Trees, BFS/DFS, and Two-Pointers.";
            case "DBMS":
                return "Practice 15 SQL query exercises focusing on multi-table JOINs, GROUP BY HAVING, and B-Tree indexing.";
            case "Web Frontend & React":
                return "Build a reactive component tree implementing custom hooks, useEffect cleanup, and state management.";
            case "Node.js & Backend Architecture":
                return "Implement a JWT-authenticated Express REST service connected to MongoDB with Mongoose aggregation.";
            case "Machine Learning & Python":
                return "Train a classification model using Scikit-Learn, performing hyperparameter tuning and cross-validation.";
            case "Data Analytics & BI (SQL/Tableau)":
                return "Write analytical SQL queries utilizing OVER (PARTITION BY) window functions and build a KPI dashboard.";
            case "OOP Concepts":
                return "Refactor code samples applying Single Responsibility and Dependency Inversion principles.";
            case "Quantitative Aptitude":
                return "Solve 20 timed aptitude questions on time-work, speed-distance, and permutations on IndiaBIX.";
            case "Logical Reasoning":
                return "Practice syllogisms and seating arrangement puzzle sets to boost speed and accuracy.";
            default:
                return "Review targeted curriculum modules and re-attempt the domain test to verify competency improvement.";
        }
    }

    private static class LearningResourceDef {
        String type;
        String title;
        String url;

        LearningResourceDef(String type, String title, String url) {
            this.type = type;
            this.title = title;
            this.url = url;
        }
    }

    private List<LearningResourceDef> getCuratedResourcesForSkill(String skill, String role) {
        List<LearningResourceDef> list = new ArrayList<>();
        switch (skill) {
            case "Java & Spring Boot":
                list.add(new LearningResourceDef("PRACTICE", "Baeldung Spring Boot REST API & Microservices Practice Suite", "https://www.baeldung.com/spring-boot"));
                list.add(new LearningResourceDef("COURSE", "Spring.io Official Building a RESTful Web Service Guide", "https://spring.io/guides/gs/rest-service"));
                break;
            case "Data Structures & Algorithms":
                list.add(new LearningResourceDef("PRACTICE", "NeetCode 150 - Core DSA Coding Patterns Roadmap", "https://neetcode.io/roadmap"));
                list.add(new LearningResourceDef("PRACTICE", "Striver's SDE Sheet - Top 79 Interview Coding Questions", "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/"));
                break;
            case "DBMS":
                list.add(new LearningResourceDef("ARTICLE", "Use The Index, Luke: SQL Indexing & Query Tuning Guide", "https://use-the-index-luke.com/"));
                list.add(new LearningResourceDef("PRACTICE", "Mode SQL Tutorial: Joins, Aggregations & Subqueries", "https://mode.com/sql-tutorial/"));
                break;
            case "Web Frontend & React":
                list.add(new LearningResourceDef("COURSE", "React.dev - Official Interactive React 18 Documentation", "https://react.dev/learn"));
                list.add(new LearningResourceDef("PRACTICE", "Full Stack Open - Modern Web Development Curriculum", "https://fullstackopen.com/en/"));
                break;
            case "Node.js & Backend Architecture":
                list.add(new LearningResourceDef("COURSE", "Node.js Official Documentation & Event Loop Architecture", "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/"));
                list.add(new LearningResourceDef("PRACTICE", "MongoDB University: M001 Basics & Aggregation Pipelines", "https://learn.mongodb.com/"));
                break;
            case "Machine Learning & Python":
                list.add(new LearningResourceDef("COURSE", "Fast.ai Practical Deep Learning for Coders", "https://course.fast.ai/"));
                list.add(new LearningResourceDef("PRACTICE", "Kaggle Learn - Machine Learning Micro-Courses", "https://www.kaggle.com/learn"));
                break;
            case "Data Analytics & BI (SQL/Tableau)":
                list.add(new LearningResourceDef("PRACTICE", "StrataScratch Real-World SQL & Data Analytics Problems", "https://www.stratascratch.com/"));
                list.add(new LearningResourceDef("ARTICLE", "Advanced Window Functions & CTEs in Analytical SQL", "https://mode.com/sql-tutorial/sql-window-functions/"));
                break;
            case "OOP Concepts":
                list.add(new LearningResourceDef("ARTICLE", "Refactoring Guru - SOLID Principles & Design Patterns", "https://refactoring.guru/design-patterns"));
                break;
            case "Quantitative Aptitude":
                list.add(new LearningResourceDef("PRACTICE", "IndiaBIX Quantitative Aptitude Placement Practice", "https://www.indiabix.com/aptitude/questions-and-answers/"));
                break;
            case "Logical Reasoning":
                list.add(new LearningResourceDef("PRACTICE", "IndiaBIX Logical Reasoning & Syllogism Drills", "https://www.indiabix.com/logical-reasoning/questions-and-answers/"));
                break;
            case "Operating Systems":
                list.add(new LearningResourceDef("ARTICLE", "OSTEP: Operating Systems - Three Easy Pieces", "https://pages.cs.wisc.edu/~remzi/OSTEP/"));
                break;
            case "Computer Networks":
                list.add(new LearningResourceDef("COURSE", "Stanford CS144: Introduction to Computer Networks", "https://cs144.github.io/"));
                break;
            case "Verbal Ability":
                list.add(new LearningResourceDef("PRACTICE", "IndiaBIX Verbal Ability & Reading Comprehension Preparation", "https://www.indiabix.com/verbal-ability/questions-and-answers/"));
                break;
            default:
                list.add(new LearningResourceDef("PRACTICE", skill + " Targeted Learning Track on LeetCode", "https://leetcode.com/explore/"));
                break;
        }
        return list;
    }

    private Map<String, Double> getRoleWeights(String role) {
        String normalized = role != null ? role.trim() : "Java Full Stack Developer";
        if (normalized.contains("MERN") || normalized.equalsIgnoreCase("MERN Full Stack Developer")) {
            return Map.of(
                "Web Frontend & React", 0.25,
                "Node.js & Backend Architecture", 0.25,
                "DBMS", 0.15,
                "Data Structures & Algorithms", 0.15,
                "OOP Concepts", 0.10,
                "Logical Reasoning", 0.10
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
                "Data Analytics & BI (SQL/Tableau)", 0.30,
                "DBMS", 0.25,
                "Quantitative Aptitude", 0.20,
                "Logical Reasoning", 0.15,
                "Verbal Ability", 0.10
            );
        } else if (normalized.contains("Cloud") || normalized.contains("DevOps")) {
            return Map.of(
                "Computer Networks", 0.25,
                "Operating Systems", 0.25,
                "DBMS", 0.15,
                "Data Structures & Algorithms", 0.15,
                "Logical Reasoning", 0.20
            );
        } else {
            // Default: Java Full Stack Developer
            return Map.of(
                "Java & Spring Boot", 0.25,
                "Data Structures & Algorithms", 0.20,
                "DBMS", 0.15,
                "Web Frontend & React", 0.15,
                "OOP Concepts", 0.10,
                "Quantitative Aptitude", 0.15
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
        } else if (normalized.contains("Cloud") || normalized.contains("DevOps")) {
            return Map.of(
                "Computer Networks", 80,
                "Operating Systems", 80,
                "DBMS", 70,
                "Data Structures & Algorithms", 65,
                "Logical Reasoning", 70
            );
        } else {
            // Default: Java Full Stack Developer
            return Map.of(
                "Java & Spring Boot", 80,
                "Data Structures & Algorithms", 75,
                "DBMS", 75,
                "Web Frontend & React", 70,
                "OOP Concepts", 75,
                "Quantitative Aptitude", 70
            );
        }
    }
}
