package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mock_interview_sessions")
public class MockInterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String studentId;

    private String targetRole = "Software Developer";
    private String interviewType = "TECHNICAL"; // TECHNICAL, BEHAVIORAL, MIXED
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED

    private Double overallScore = 0.0;
    private Double technicalScore = 0.0;
    private Double communicationScore = 0.0;

    @Column(columnDefinition = "TEXT")
    private String feedback = "";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;

    public MockInterviewSession() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }
    public Double getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Double technicalScore) { this.technicalScore = technicalScore; }
    public Double getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Double communicationScore) { this.communicationScore = communicationScore; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
