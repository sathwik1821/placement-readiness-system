package com.placement.system.controller;

import com.placement.system.model.InterviewQuestion;
import com.placement.system.model.InterviewResponse;
import com.placement.system.model.MockInterviewSession;
import com.placement.system.model.Student;
import com.placement.system.repository.InterviewQuestionRepository;
import com.placement.system.repository.InterviewResponseRepository;
import com.placement.system.repository.MockInterviewSessionRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.service.GeminiInterviewService;
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

    @Autowired
    private GeminiInterviewService geminiService;

    @PostMapping("/sessions")
    public ResponseEntity<?> startSession(
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey,
            @RequestBody Map<String, String> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student profile not found. Complete profile first."));
        }

        String role = body.getOrDefault("targetRole", "Java Full Stack Developer");
        String type = body.getOrDefault("interviewType", "TECHNICAL");

        MockInterviewSession session = new MockInterviewSession();
        session.setStudentId(student.getId());
        session.setTargetRole(role);
        session.setInterviewType(type);
        session.setStatus("IN_PROGRESS");
        session = sessionRepository.save(session);

        // Dynamically generate opening question using Gemini LLM
        GeminiInterviewService.InitialQuestionResult initialQ = geminiService.generateInitialQuestion(role, type, student, customApiKey);

        InterviewQuestion q = new InterviewQuestion();
        q.setSessionId(session.getId());
        q.setQuestionText(initialQ.questionText());
        q.setQuestionType(type);
        q.setSequenceNumber(1);
        q = questionRepository.save(q);

        Map<String, Object> respMap = new HashMap<>();
        respMap.put("session", session);
        respMap.put("question", q);
        respMap.put("aiModel", initialQ.aiModel());
        respMap.put("topic", initialQ.topic());
        respMap.put("difficulty", initialQ.difficulty());
        return ResponseEntity.ok(respMap);
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
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey,
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

        // Retrieve existing Q&A history for context
        List<InterviewQuestion> allQs = questionRepository.findBySessionIdOrderBySequenceNumberAsc(session.getId());
        List<InterviewResponse> existingResponses = responseRepository.findBySessionId(session.getId());

        InterviewQuestion currentQuestion = allQs.stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElse(null);
        String currentQuestionText = currentQuestion != null ? currentQuestion.getQuestionText() : "Interview technical query";

        List<Map<String, String>> historyList = new ArrayList<>();
        for (InterviewQuestion pastQ : allQs) {
            existingResponses.stream()
                    .filter(r -> pastQ.getId().equals(r.getQuestionId()))
                    .findFirst()
                    .ifPresent(r -> historyList.add(Map.of(
                            "question", pastQ.getQuestionText() != null ? pastQ.getQuestionText() : "",
                            "answer", r.getResponseText() != null ? r.getResponseText() : ""
                    )));
        }

        int currentTurn = existingResponses.size() + 1;
        int maxTurns = 4;

        // Dynamic Turn Evaluation using Gemini LLM
        GeminiInterviewService.AnswerEvaluationResult evalResult = geminiService.evaluateAnswer(
                session.getTargetRole(),
                session.getInterviewType(),
                currentQuestionText,
                text,
                historyList,
                currentTurn,
                maxTurns,
                customApiKey
        );

        InterviewResponse resp = new InterviewResponse();
        resp.setSessionId(session.getId());
        resp.setQuestionId(questionId);
        resp.setResponseText(text);
        resp.setTechnicalScore(evalResult.technicalScore());
        resp.setCommunicationScore(evalResult.communicationScore());
        resp.setAiFeedback(evalResult.aiFeedback());
        resp = responseRepository.save(resp);

        int nextSeq = currentTurn + 1;
        InterviewQuestion followUp = null;
        boolean isComplete = evalResult.isComplete() || nextSeq > maxTurns;

        if (!isComplete && evalResult.followUpQuestion() != null && !evalResult.followUpQuestion().isBlank()) {
            followUp = new InterviewQuestion();
            followUp.setSessionId(session.getId());
            followUp.setQuestionText(evalResult.followUpQuestion());
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
        res.put("keyStrengths", evalResult.keyStrengths());
        res.put("areasForImprovement", evalResult.areasForImprovement());
        res.put("aiModel", evalResult.aiModel());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/sessions/{id}/complete")
    public ResponseEntity<?> completeSession(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey) {

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
            responses.stream()
                .filter(r -> q.getId().equals(r.getQuestionId()))
                .findFirst()
                .ifPresent(r -> {
                    Map<String, Object> turn = new HashMap<>();
                    turn.put("question", q.getQuestionText());
                    turn.put("answer", r.getResponseText());
                    turn.put("technicalScore", r.getTechnicalScore());
                    turn.put("communicationScore", r.getCommunicationScore());
                    turn.put("aiFeedback", r.getAiFeedback());
                    turns.add(turn);
                });
        }

        // Generate Comprehensive Post-Interview Evaluation Dossier using Gemini LLM
        GeminiInterviewService.FinalVerdictResult finalVerdict = geminiService.generateFinalEvaluation(
                session.getTargetRole(),
                session.getInterviewType(),
                turns,
                customApiKey
        );

        session.setStatus("COMPLETED");
        session.setTechnicalScore(Math.round(finalVerdict.technicalScore() * 10.0) / 10.0);
        session.setCommunicationScore(Math.round(finalVerdict.communicationScore() * 10.0) / 10.0);
        session.setOverallScore(Math.round(finalVerdict.overallScore() * 10.0) / 10.0);
        session.setCompletedAt(LocalDateTime.now());
        session.setFeedback(finalVerdict.executiveSummary());
        session = sessionRepository.save(session);

        Map<String, Object> result = new HashMap<>();
        result.put("session", session);
        result.put("overallScore", session.getOverallScore());
        result.put("technicalScore", session.getTechnicalScore());
        result.put("communicationScore", session.getCommunicationScore());
        result.put("verdict", finalVerdict.verdict());
        result.put("executiveSummary", finalVerdict.executiveSummary());
        result.put("demonstratedStrengths", finalVerdict.demonstratedStrengths());
        result.put("criticalGrowthAreas", finalVerdict.criticalGrowthAreas());
        result.put("actionableRecommendations", finalVerdict.actionableRecommendations());
        result.put("aiModel", finalVerdict.aiModel());
        result.put("feedback", session.getFeedback());

        return ResponseEntity.ok(result);
    }
}
