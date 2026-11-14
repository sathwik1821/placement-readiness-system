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
        "Software Developer", List.of(
            "Can you explain how a Hash Map handles collision resolution internally, and discuss the performance difference between separate chaining and open addressing?",
            "How would you design a scalable rate limiter for a distributed microservices architecture handling 100,000 requests per second?",
            "Explain the difference between optimistic and pessimistic locking in database transactions, and describe a scenario where each is preferred.",
            "What happens under the hood when a thread enters a synchronized block or acquires a mutex lock in a multi-threaded system?",
            "How do you approach identifying and resolving memory leaks in a long-running production service?"
        ),
        "Full Stack Developer", List.of(
            "Explain how the React Virtual DOM diffing algorithm (Reconciliation) optimizes UI updates, and what pitfalls can cause unnecessary re-renders.",
            "Compare REST and GraphQL architectures. Under what specific product and network constraints would you select GraphQL over REST?",
            "How do you implement secure stateless JWT authentication with refresh token rotation and defend against XSS and CSRF attacks?",
            "Walk me through how a browser renders a web page from the initial DNS lookup to painting pixels on the screen.",
            "How would you optimize a slow database query involving a three-table JOIN in an e-commerce platform?"
        ),
        "Systems Engineer", List.of(
            "What is the difference between kernel space and user space, and what triggers an operating system context switch?",
            "Explain virtual memory management, page tables, and how a Translation Lookaside Buffer (TLB) accelerates memory translation.",
            "How do interrupt service routines (ISRs) handle hardware interrupts without causing race conditions with scheduled user threads?",
            "What is the significance of cache coherence protocols (such as MESI) in multi-core symmetric multiprocessing architectures?",
            "How would you implement a lock-free ring buffer for low-latency inter-process communication?"
        ),
        "Data Analyst", List.of(
            "Explain the difference between WHERE and HAVING in SQL, and demonstrate how you would use a window function like DENSE_RANK() or ROW_NUMBER().",
            "What is the bias-variance tradeoff in predictive modeling, and how does regularization (L1 Lasso vs L2 Ridge) mitigate overfitting?",
            "How do you detect, validate, and handle skewed distributions and missing values in high-dimensional tabular datasets?",
            "Describe the difference between Precision and Recall. In a fraudulent transaction detection system, which metric would you prioritize and why?",
            "How would you design an automated ETL pipeline that validates data quality and schema conformity before ingestion into a data warehouse?"
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

        String role = body.getOrDefault("targetRole", "Software Developer");
        String type = body.getOrDefault("interviewType", "TECHNICAL");

        MockInterviewSession session = new MockInterviewSession();
        session.setStudentId(studentId);
        session.setTargetRole(role);
        session.setInterviewType(type);
        session.setStatus("IN_PROGRESS");
        session = sessionRepository.save(session);

        List<String> pool = "BEHAVIORAL".equalsIgnoreCase(type)
            ? ROLE_QUESTIONS.get("BEHAVIORAL")
            : ROLE_QUESTIONS.getOrDefault(role, ROLE_QUESTIONS.get("Software Developer"));

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
    public ResponseEntity<?> getSessionDetails(@PathVariable String id) {
        MockInterviewSession session = sessionRepository.findById(id).orElse(null);
        if (session == null) return ResponseEntity.notFound().build();

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
    public ResponseEntity<?> answerQuestion(@PathVariable String id, @RequestBody Map<String, String> body) {
        MockInterviewSession session = sessionRepository.findById(id).orElse(null);
        if (session == null) return ResponseEntity.notFound().build();

        String questionId = body.get("questionId");
        String text = body.getOrDefault("responseText", "").trim();
        int words = text.isEmpty() ? 0 : text.split("\\s+").length;

        // Semantic & NLP heuristic scoring
        String lower = text.toLowerCase();
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

        // Structural communication markers
        int structureHits = 0;
        String[] structWords = {"firstly", "secondly", "furthermore", "in contrast", "specifically", "for example", "as a result", "consequently"};
        for (String sw : structWords) {
            if (lower.contains(sw)) structureHits++;
        }

        double baseTech = 55.0 + Math.min(25.0, words * 0.35) + Math.min(18.0, technicalKeywordHits * 4.5);
        double baseComm = 60.0 + Math.min(22.0, words * 0.25) + Math.min(15.0, structureHits * 5.0);

        double techScore = Math.min(96.0, Math.max(45.0, Math.round(baseTech)));
        double commScore = Math.min(98.0, Math.max(50.0, Math.round(baseComm)));

        // Personalized constructive AI rubric feedback
        StringBuilder fb = new StringBuilder();
        if (technicalKeywordHits >= 3) {
            fb.append("Strong technical vocabulary demonstrated; effectively articulated operational mechanics. ");
        } else if (words < 25) {
            fb.append("Your response was brief. Elaborate on edge cases, failure scenarios, and computational complexity to show senior-level depth. ");
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
                List<String> pool = ROLE_QUESTIONS.getOrDefault(session.getTargetRole(), ROLE_QUESTIONS.get("Software Developer"));
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
    public ResponseEntity<?> completeSession(@PathVariable String id) {
        MockInterviewSession session = sessionRepository.findById(id).orElse(null);
        if (session == null) return ResponseEntity.notFound().build();

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
