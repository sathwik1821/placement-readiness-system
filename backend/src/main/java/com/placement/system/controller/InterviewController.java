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

    private static final List<String> TECH_QUESTIONS = List.of(
        "Can you explain the difference between a process and a thread, and how context switching works in modern operating systems?",
        "How do you design a database schema for an e-commerce order system to ensure strict ACID transaction guarantees?",
        "What is the difference between TCP and UDP? When would an engineer deliberately choose UDP over TCP?",
        "Explain how hash tables handle collisions and analyze their average vs worst-case lookup complexities.",
        "Describe the SOLID principles in software engineering with a real-world object-oriented code example."
    );

    private static final List<String> BEHAVIORAL_QUESTIONS = List.of(
        "Tell me about a technical project where you faced an unexpected roadblock and how you methodically resolved it.",
        "Describe a situation where you had a strong disagreement with a team member about system architecture or design.",
        "How do you prioritize competing deadlines when multiple tasks require urgent attention?",
        "Give an example of how you picked up an unfamiliar framework or tech stack under a tight deliverable timeline."
    );

    @PostMapping("/sessions")
    public ResponseEntity<?> startSession(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        String studentId = studentRepository.findByUserId(userId).map(s -> s.getId()).orElse(null);
        if (studentId == null) return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));

        String role = body.getOrDefault("targetRole", "Software Developer");
        String type = body.getOrDefault("interviewType", "TECHNICAL");

        MockInterviewSession session = new MockInterviewSession();
        session.setStudentId(studentId);
        session.setTargetRole(role);
        session.setInterviewType(type);
        session.setStatus("IN_PROGRESS");
        session = sessionRepository.save(session);

        List<String> pool = "BEHAVIORAL".equalsIgnoreCase(type) ? BEHAVIORAL_QUESTIONS : TECH_QUESTIONS;
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

    @PostMapping("/sessions/{id}/answer")
    public ResponseEntity<?> answerQuestion(@PathVariable String id, @RequestBody Map<String, String> body) {
        MockInterviewSession session = sessionRepository.findById(id).orElse(null);
        if (session == null) return ResponseEntity.notFound().build();

        String questionId = body.get("questionId");
        String text = body.getOrDefault("responseText", "");
        int words = text.trim().split("\\s+").length;

        double techScore = Math.min(95.0, Math.max(50.0, 50.0 + Math.min(30.0, words * 0.4)));
        double commScore = Math.min(95.0, Math.max(55.0, 55.0 + Math.min(25.0, words * 0.3)));

        String feedback = "Clear structural clarity. Highlighting explicit operational trade-offs and quantitative benchmarks will further demonstrate senior-level readiness.";

        InterviewResponse resp = new InterviewResponse();
        resp.setSessionId(session.getId());
        resp.setQuestionId(questionId);
        resp.setResponseText(text);
        resp.setTechnicalScore(techScore);
        resp.setCommunicationScore(commScore);
        resp.setAiFeedback(feedback);
        resp = responseRepository.save(resp);

        List<InterviewQuestion> allQs = questionRepository.findBySessionIdOrderBySequenceNumberAsc(session.getId());
        int nextSeq = allQs.size() + 1;
        InterviewQuestion followUp = null;
        boolean isComplete = false;

        if (nextSeq <= 4) {
            List<String> pool = "BEHAVIORAL".equalsIgnoreCase(session.getInterviewType()) ? BEHAVIORAL_QUESTIONS : TECH_QUESTIONS;
            String nextQText = pool.get(new Random().nextInt(pool.size()));
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
        double avgTech = responses.isEmpty() ? 70.0 : responses.stream().mapToDouble(InterviewResponse::getTechnicalScore).average().orElse(70.0);
        double avgComm = responses.isEmpty() ? 72.0 : responses.stream().mapToDouble(InterviewResponse::getCommunicationScore).average().orElse(72.0);
        double overall = Math.round((avgTech * 0.6) + (avgComm * 0.4));

        session.setStatus("COMPLETED");
        session.setTechnicalScore(avgTech);
        session.setCommunicationScore(avgComm);
        session.setOverallScore(overall);
        session.setCompletedAt(LocalDateTime.now());
        session.setFeedback("Candidate demonstrated solid foundational grasp (" + Math.round(avgTech) + "%). Communication clarity reached " + Math.round(avgComm) + "%. Recommended next step: Continue mock drills focusing on concurrency models.");
        session = sessionRepository.save(session);

        return ResponseEntity.ok(session);
    }
}
