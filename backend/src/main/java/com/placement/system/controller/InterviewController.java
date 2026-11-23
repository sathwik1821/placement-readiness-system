package com.placement.system.controller;

import com.placement.system.model.InterviewQuestion;
import com.placement.system.model.InterviewResponse;
import com.placement.system.model.MockInterviewSession;
import com.placement.system.repository.InterviewQuestionRepository;
import com.placement.system.repository.InterviewResponseRepository;
import com.placement.system.repository.MockInterviewSessionRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private MockInterviewSessionRepository sessionRepository;

    @Autowired
    private InterviewQuestionRepository questionRepository;

    @Autowired
    private InterviewResponseRepository responseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JwtService jwtService;

    // Categorized domain question banks
    private static final Map<String, List<String>> ROLE_QUESTIONS = Map.of(
        "Java Full Stack Developer", List.of(
            "How does the JVM Garbage Collector manage memory across Eden, Survivor, and Tenured spaces, and how do you diagnose OutOfMemoryError?",
            "Explain the difference between @Component, @Service, and @Repository in Spring Boot, and how Spring manages bean lifecycles.",
            "How would you design a scalable microservices architecture using Spring Boot, Spring Cloud Eureka, and a resilient Circuit Breaker (Resilience4j)?",
            "Explain optimistic vs pessimistic locking in JPA/Hibernate transactions and how to resolve dirty read race conditions in high-throughput databases.",
            "How do you implement secure stateless JWT authentication and CORS configurations in Spring Security?"
        ),
        "MERN Full Stack Developer", List.of(
            "Explain how the React Virtual DOM diffing algorithm (Reconciliation) optimizes UI updates, and what pitfalls can cause unnecessary component re-renders.",
            "How does the Node.js Event Loop process microtasks (process.nextTick, Promise callbacks) vs macrotasks (setTimeout, setImmediate)?",
            "In MongoDB, when would you choose document referencing with populate() versus embedded subdocuments, and how do indexes affect write performance?",
            "Compare REST and GraphQL architectures. Under what specific product and network constraints would you select GraphQL over REST?",
            "How do you design a state management architecture in React (Zustand or Redux Toolkit) with optimistic UI updates and async error handling?"
        ),
        "AI / ML Engineer", List.of(
            "Explain the bias-variance tradeoff in predictive modeling, and discuss how regularization (L1 Lasso vs L2 Ridge) mitigates model overfitting.",
            "What mathematical problem does the Backpropagation algorithm solve in Deep Neural Networks, and why is the chain rule of calculus essential?",
            "Describe the difference between Precision and Recall. In an autonomous fraud detection or medical diagnosis system, which metric would you optimize and why?",
            "How do Transformer architectures with Self-Attention mechanisms overcome the sequential bottleneck of Recurrent Neural Networks (RNNs)?",
            "Walk me through your pipeline for handling skewed multimodal tabular datasets with severe class imbalances and data leakage."
        ),
        "Data Analyst", List.of(
            "Explain the difference between WHERE and HAVING in SQL, and demonstrate how you would use a window function like DENSE_RANK() or ROW_NUMBER().",
            "How do you detect, validate, and handle skewed distributions and missing values in high-dimensional tabular datasets?",
            "In business intelligence, what is the architectural difference between a Star Schema and a Snowflake Schema for an OLAP data warehouse?",
            "How would you design an automated ETL pipeline that validates data quality, schema conformity, and data freshness before ingestion into dashboards?",
            "Explain the difference between correlation and causation in exploratory business data analysis with an industry example."
        ),
        "BEHAVIORAL", List.of(
            "Tell me about a challenging engineering project where you encountered an unexpected technical failure right before a critical deadline. How did you resolve it?",
            "Describe a situation where you had a significant technical disagreement with a teammate regarding system design. How did you align on a solution?",
            "Give an example of a time you received constructive but critical feedback on your code or deliverables. How did you incorporate it?",
            "Describe a situation where you had to quickly learn an unfamiliar technology stack or framework to deliver a project milestone under tight constraints."
        )
    );

    @PostMapping("/sessions")
    public ResponseEntity<?> startSession(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.badRequest().body(Map.of("error", "Student profile not found. Complete profile first."));

        String role = body.getOrDefault("targetRole", "Java Full Stack Developer");
        String type = body.getOrDefault("interviewType", "TECHNICAL");

        MockInterviewSession session = new MockInterviewSession();
        session.setStudentId(studentId);
        session.setTargetRole(role);
        session.setInterviewType(type);
        session.setStatus("IN_PROGRESS");
        session = sessionRepository.save(session);

        List<String> pool = "BEHAVIORAL".equalsIgnoreCase(type)
            ? ROLE_QUESTIONS.get("BEHAVIORAL")
            : ROLE_QUESTIONS.getOrDefault(role, ROLE_QUESTIONS.get("Java Full Stack Developer"));
        if (pool == null || pool.isEmpty()) {
            pool = ROLE_QUESTIONS.get("Java Full Stack Developer");
        }

        String firstQ = pool.get(new Random().nextInt(pool.size()));

        InterviewQuestion q = new InterviewQuestion();
        q.setSessionId(session.getId());
        q.setQuestionText(firstQ);
        q.setQuestionType(type);
        q.setSequenceNumber(1);
        q = questionRepository.save(q);

        return ResponseEntity.ok(Map.of("session", session, "question", q));
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(sessionRepository.findByStudentIdOrderByCreatedAtDesc(studentId));
    }

    @GetMapping("/sessions/{id}/details")
    public ResponseEntity<?> getSessionDetails(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        // IDOR protection: verify session belongs to caller
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);

        MockInterviewSession session = sessionRepository.findById(id).orElse(null);
        if (session == null) return ResponseEntity.notFound().build();

        if (studentId == null || !session.getStudentId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this interview session"));
        }

        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderBySequenceNumberAsc(session.getId());
        List<InterviewResponse> responses = responseRepository.findBySessionId(session.getId());

        List<Map<String, Object>> turns = new ArrayList<>();
        for (InterviewQuestion q : questions) {
            InterviewResponse resp = responses.stream()
                .filter(r -> q.getId().equals(r.getQuestionId()))
                .findFirst().orElse(null);

            turns.add(Map.of(
                "question", q,
                "response", resp != null ? resp : Map.of()
            ));
        }

        return ResponseEntity.ok(Map.of(
            "session", session,
            "turns", turns
        ));
    }

    @PostMapping("/sessions/{id}/answer")
    public ResponseEntity<?> answerQuestion(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {

        // IDOR protection: verify session belongs to caller
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);

        MockInterviewSession session = sessionRepository.findById(id).orElse(null);
        if (session == null) return ResponseEntity.notFound().build();

        if (studentId == null || !session.getStudentId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this interview session"));
        }

        String questionId = body.get("questionId");
        String text = body.getOrDefault("responseText", "").trim();
        String[] wordArray = text.isEmpty() ? new String[0] : text.split("\\s+");
        int words = wordArray.length;

        // --- Anti-spam / keyword-spoofing measures ---
        String lower = text.toLowerCase();

        // 1. Unique word ratio check — penalize word salad
        Set<String> uniqueWords = new HashSet<>(Arrays.asList(wordArray));
        double uniqueRatio = words > 0 ? (double) uniqueWords.size() / words : 0;

        // 2. Sentence count check (count periods, question marks, exclamation marks)
        long sentenceCount = text.chars().filter(c -> c == '.' || c == '?' || c == '!').count();

        int technicalKeywordHits = 0;
        String[] keywords = {
            "complexity", "o(1)", "o(n)", "o(log", "space", "time", "trade-off", "tradeoff",
            "index", "cache", "latency", "throughput", "concurrency", "lock", "thread",
            "acid", "distributed", "asynchronous", "scalability", "architecture", "microservice",
            "memory", "buffer", "star", "situation", "task", "action", "result", "metric"
        };
        for (String kw : keywords) {
            if (lower.contains(kw)) technicalKeywordHits++;
        }

        // 3. Keyword density cap — if keyword density > 15%, cap keyword bonus
        double keywordDensity = words > 0 ? (double) technicalKeywordHits / words : 0;
        double cappedKeywordHits = technicalKeywordHits;
        if (keywordDensity > 0.15 && words > 10) {
            cappedKeywordHits = Math.min(technicalKeywordHits, (int)(words * 0.15));
        }

        // Structural communication markers
        int structureHits = 0;
        String[] structWords = {"firstly", "secondly", "furthermore", "in contrast", "specifically", "for example", "as a result", "consequently"};
        for (String sw : structWords) {
            if (lower.contains(sw)) structureHits++;
        }

        // Reduced multipliers (from 0.35/4.5 to 0.25/3.0)
        double baseTech = 55.0 + Math.min(25.0, words * 0.25) + Math.min(18.0, cappedKeywordHits * 3.0);
        double baseComm = 60.0 + Math.min(22.0, words * 0.25) + Math.min(15.0, structureHits * 5.0);

        // 4. Penalize low unique word ratio (spam / repetition)
        if (uniqueRatio < 0.4 && words > 15) {
            baseTech -= 15.0;
            baseComm -= 10.0;
        }

        // 5. Penalize if fewer than 2 sentences
        if (sentenceCount < 2 && words > 10) {
            baseComm -= 8.0;
        }

        double techScore = Math.min(96.0, Math.max(45.0, Math.round(baseTech)));
        double commScore = Math.min(98.0, Math.max(50.0, Math.round(baseComm)));

        // Personalized constructive AI rubric feedback
        StringBuilder fb = new StringBuilder();
        if (technicalKeywordHits >= 3 && uniqueRatio >= 0.4) {
            fb.append("Strong technical vocabulary demonstrated; effectively articulated operational mechanics. ");
        } else if (words < 25) {
            fb.append("Your response was brief. Elaborate on edge cases, failure scenarios, and computational complexity to show senior-level depth. ");
        } else if (uniqueRatio < 0.4) {
            fb.append("Your response appeared repetitive. Focus on diverse, concrete points with specific examples. ");
        } else {
            fb.append("Good foundational rationale. Quantifying trade-offs (e.g. latency vs consistency) will strengthen technical conviction. ");
        }

        if (structureHits > 0) {
            fb.append("Structured explanation was logical and easy to follow.");
        } else {
            fb.append("Tip: Use structured framing (e.g., Problem -> Constraint -> Approach -> Complexity) for clearer delivery.");
        }

        InterviewResponse resp = new InterviewResponse();
        resp.setSessionId(session.getId());
        resp.setQuestionId(questionId);
        resp.setResponseText(text);
        resp.setTechnicalScore(techScore);
        resp.setCommunicationScore(commScore);
        resp.setAiFeedback(fb.toString());
        resp = responseRepository.save(resp);

        List<InterviewQuestion> allQs = questionRepository.findBySessionIdOrderBySequenceNumberAsc(session.getId());
        int nextSeq = allQs.size() + 1;
        InterviewQuestion followUp = null;
        boolean isComplete = false;

        if (nextSeq <= 4) {
            // Contextual dynamic follow-up logic
            String nextQText;
            if (lower.contains("cache") || lower.contains("redis")) {
                nextQText = "Building on your caching premise, how would you address cache stampede (thundering herd) and cache penetration under peak traffic?";
            } else if (lower.contains("database") || lower.contains("sql") || lower.contains("transaction")) {
                nextQText = "Following up on data consistency: how would you maintain transactional boundaries across multiple decoupled services where distributed 2-Phase Commit is unviable?";
            } else if (lower.contains("thread") || lower.contains("lock") || lower.contains("concurrency")) {
                nextQText = "Since you referenced synchronization: what is priority inversion, and how do modern RTOS and OS kernels mitigate it?";
            } else if ("BEHAVIORAL".equalsIgnoreCase(session.getInterviewType())) {
                List<String> bPool = ROLE_QUESTIONS.get("BEHAVIORAL");
                nextQText = bPool.get((nextSeq - 1) % bPool.size());
            } else {
                List<String> pool = ROLE_QUESTIONS.getOrDefault(session.getTargetRole(), ROLE_QUESTIONS.get("Java Full Stack Developer"));
                nextQText = pool.get((nextSeq - 1) % pool.size());
            }

            followUp = new InterviewQuestion();
            followUp.setSessionId(session.getId());
            followUp.setQuestionText(nextQText);
            followUp.setQuestionType(session.getInterviewType());
            followUp.setSequenceNumber(nextSeq);
            followUp.setFollowUpOf(questionId);
            followUp = questionRepository.save(followUp);
        } else {
            isComplete = true;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("response", resp);
        res.put("followUp", followUp);
        res.put("isComplete", isComplete);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/sessions/{id}/complete")
    public ResponseEntity<?> completeSession(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {

        // IDOR protection: verify session belongs to caller
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);

        MockInterviewSession session = sessionRepository.findById(id).orElse(null);
        if (session == null) return ResponseEntity.notFound().build();

        if (studentId == null || !session.getStudentId().equals(studentId)) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this interview session"));
        }

        List<InterviewResponse> responses = responseRepository.findBySessionId(session.getId());
        double avgTech = responses.isEmpty() ? 72.0 : responses.stream().mapToDouble(InterviewResponse::getTechnicalScore).average().orElse(72.0);
        double avgComm = responses.isEmpty() ? 75.0 : responses.stream().mapToDouble(InterviewResponse::getCommunicationScore).average().orElse(75.0);
        double overall = Math.round((avgTech * 0.6) + (avgComm * 0.4));

        session.setStatus("COMPLETED");
        session.setTechnicalScore(Math.round(avgTech * 10.0) / 10.0);
        session.setCommunicationScore(Math.round(avgComm * 10.0) / 10.0);
        session.setOverallScore(overall);
        session.setCompletedAt(LocalDateTime.now());

        String verdict = overall >= 80.0
            ? "Candidate demonstrated outstanding competence (" + Math.round(overall) + "%). Strong conceptual mastery, crisp communication structure, and solid algorithmic thinking."
            : overall >= 65.0
            ? "Candidate demonstrated solid foundational grasp (" + Math.round(overall) + "%). Good technical grounding; recommend reinforcing concurrency models and quantitative trade-off justifications."
            : "Candidate showed developing awareness (" + Math.round(overall) + "%). Key recommendation: Practice STAR framework structuring and review core data structure complexity trade-offs.";

        session.setFeedback(verdict);
        session = sessionRepository.save(session);

        return ResponseEntity.ok(session);
    }
}
