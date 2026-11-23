package com.placement.system.service;

import com.placement.system.model.InterviewQuestion;
import com.placement.system.model.InterviewResponse;
import com.placement.system.model.MockInterviewSession;
import com.placement.system.model.Student;
import com.placement.system.repository.InterviewQuestionRepository;
import com.placement.system.repository.InterviewResponseRepository;
import com.placement.system.repository.MockInterviewSessionRepository;
import com.placement.system.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class InterviewService {

    @Autowired
    private MockInterviewSessionRepository sessionRepository;

    @Autowired
    private InterviewQuestionRepository questionRepository;

    @Autowired
    private InterviewResponseRepository responseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GeminiInterviewService geminiService;

    public Map<String, Object> startSession(String userId, String targetRole, String interviewType, String customApiKey) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found. Complete profile first."));

        String role = targetRole != null && !targetRole.isBlank() ? targetRole : "Java Full Stack Developer";
        String type = interviewType != null && !interviewType.isBlank() ? interviewType : "TECHNICAL";

        MockInterviewSession session = new MockInterviewSession();
        session.setStudentId(student.getId());
        session.setTargetRole(role);
        session.setInterviewType(type);
        session.setStatus("IN_PROGRESS");
        session = sessionRepository.save(session);

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
        return respMap;
    }

    @Transactional(readOnly = true)
    public List<MockInterviewSession> getStudentSessions(String userId) {
        String studentId = studentRepository.findByUserId(userId).map(Student::getId).orElse(null);
        if (studentId == null) return List.of();
        return sessionRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSessionDetails(String sessionId, String userId) {
        String studentId = studentRepository.findByUserId(userId).map(Student::getId).orElse(null);
        MockInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Interview session not found"));

        if (studentId == null || !session.getStudentId().equals(studentId)) {
            throw new IllegalStateException("You do not own this interview session");
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

        return Map.of("session", session, "turns", turns);
    }

    public Map<String, Object> answerQuestion(String sessionId, String userId, String questionId, String responseText, String customApiKey) {
        String studentId = studentRepository.findByUserId(userId).map(Student::getId).orElse(null);
        MockInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Interview session not found"));

        if (studentId == null || !session.getStudentId().equals(studentId)) {
            throw new IllegalStateException("You do not own this interview session");
        }

        String text = responseText != null ? responseText.trim() : "";
        List<InterviewQuestion> allQs = questionRepository.findBySessionIdOrderBySequenceNumberAsc(session.getId());
        List<InterviewResponse> existingResponses = responseRepository.findBySessionId(session.getId());

        InterviewQuestion currentQuestion = allQs.stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst().orElse(null);
        String currentQuestionText = currentQuestion != null ? currentQuestion.getQuestionText() : "Interview query";

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

        InterviewResponse response = new InterviewResponse();
        response.setQuestionId(questionId);
        response.setSessionId(sessionId);
        response.setResponseText(text);
        response.setAiFeedback(evalResult.aiFeedback());
        response.setTechnicalScore(evalResult.technicalScore());
        response.setCommunicationScore(evalResult.communicationScore());
        response = responseRepository.save(response);

        InterviewQuestion nextQ = null;
        if (!evalResult.isComplete() && evalResult.followUpQuestion() != null && !evalResult.followUpQuestion().isBlank()) {
            nextQ = new InterviewQuestion();
            nextQ.setSessionId(session.getId());
            nextQ.setQuestionText(evalResult.followUpQuestion());
            nextQ.setQuestionType(session.getInterviewType());
            nextQ.setSequenceNumber(allQs.size() + 1);
            nextQ = questionRepository.save(nextQ);
        } else {
            session.setStatus("COMPLETED");
            List<InterviewResponse> allCompletedResponses = new ArrayList<>(existingResponses);
            allCompletedResponses.add(response);

            double avgTech = allCompletedResponses.stream().mapToDouble(InterviewResponse::getTechnicalScore).average().orElse(70.0);
            double avgComm = allCompletedResponses.stream().mapToDouble(InterviewResponse::getCommunicationScore).average().orElse(70.0);

            session.setTechnicalScore(avgTech);
            session.setCommunicationScore(avgComm);
            session.setOverallScore(Math.round(((avgTech * 0.6) + (avgComm * 0.4)) * 10.0) / 10.0);
            session.setFeedback(evalResult.aiFeedback());
            session.setCompletedAt(java.time.LocalDateTime.now());
            sessionRepository.save(session);
        }

        Map<String, Object> respMap = new HashMap<>();
        respMap.put("evaluation", response);
        respMap.put("response", response);
        respMap.put("isComplete", evalResult.isComplete());
        respMap.put("nextQuestion", nextQ);
        respMap.put("followUp", nextQ);
        respMap.put("keyStrengths", evalResult.keyStrengths() != null ? evalResult.keyStrengths() : List.of());
        respMap.put("areasForImprovement", evalResult.areasForImprovement() != null ? evalResult.areasForImprovement() : List.of());
        respMap.put("session", session);
        respMap.put("aiModel", evalResult.aiModel());
        return respMap;
    }

    public Map<String, Object> completeSession(String sessionId, String userId, String customApiKey) {
        String studentId = studentRepository.findByUserId(userId).map(Student::getId).orElse(null);
        MockInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Interview session not found"));

        if (studentId == null || !session.getStudentId().equals(studentId)) {
            throw new IllegalStateException("You do not own this interview session");
        }

        session.setStatus("COMPLETED");

        List<InterviewQuestion> allQs = questionRepository.findBySessionIdOrderBySequenceNumberAsc(session.getId());
        List<InterviewResponse> existingResponses = responseRepository.findBySessionId(session.getId());

        List<Map<String, Object>> turns = new ArrayList<>();
        for (InterviewQuestion q : allQs) {
            existingResponses.stream()
                    .filter(r -> q.getId().equals(r.getQuestionId()))
                    .findFirst()
                    .ifPresent(r -> {
                        Map<String, Object> turn = new HashMap<>();
                        turn.put("question", q.getQuestionText());
                        turn.put("response", r.getResponseText());
                        turn.put("technicalScore", r.getTechnicalScore());
                        turn.put("communicationScore", r.getCommunicationScore());
                        turn.put("aiFeedback", r.getAiFeedback());
                        turns.add(turn);
                    });
        }

        GeminiInterviewService.FinalVerdictResult finalVerdict = geminiService.generateFinalEvaluation(
                session.getTargetRole(), session.getInterviewType(), turns, customApiKey
        );

        double avgTech = turns.stream().mapToDouble(t -> {
            Object o = t.get("technicalScore");
            return o instanceof Number ? ((Number) o).doubleValue() : 70.0;
        }).average().orElse(70.0);

        double avgComm = turns.stream().mapToDouble(t -> {
            Object o = t.get("communicationScore");
            return o instanceof Number ? ((Number) o).doubleValue() : 70.0;
        }).average().orElse(70.0);

        session.setTechnicalScore(avgTech);
        session.setCommunicationScore(avgComm);
        session.setOverallScore(finalVerdict.overallScore() > 0 ? finalVerdict.overallScore() : Math.round(((avgTech * 0.6) + (avgComm * 0.4)) * 10.0) / 10.0);
        session.setFeedback(finalVerdict.executiveSummary());
        session.setCompletedAt(java.time.LocalDateTime.now());
        session = sessionRepository.save(session);

        Map<String, Object> scorecard = new HashMap<>();
        scorecard.put("session", session);
        scorecard.put("overallScore", session.getOverallScore());
        scorecard.put("technicalScore", session.getTechnicalScore());
        scorecard.put("communicationScore", session.getCommunicationScore());
        scorecard.put("verdict", finalVerdict.verdict());
        scorecard.put("executiveSummary", finalVerdict.executiveSummary());
        scorecard.put("demonstratedStrengths", finalVerdict.demonstratedStrengths());
        scorecard.put("criticalGrowthAreas", finalVerdict.criticalGrowthAreas());
        scorecard.put("actionableRecommendations", finalVerdict.actionableRecommendations());
        scorecard.put("turns", turns);
        scorecard.put("aiModel", finalVerdict.aiModel());
        return scorecard;
    }
}
