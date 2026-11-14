package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "analysis_reports")
public class AnalysisReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String studentId;

    private Double readinessScore = 0.0;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String readinessBreakdown = "{}";

    @Lob
    @Column(columnDefinition = "TEXT")
    private String strengths = "[]";

    @Lob
    @Column(columnDefinition = "TEXT")
    private String skillGaps = "[]";

    @Lob
    @Column(columnDefinition = "TEXT")
    private String aiFeedback = "";

    private LocalDateTime generatedAt = LocalDateTime.now();

    @Transient
    private List<LearningRecommendation> recommendations = new ArrayList<>();

    public AnalysisReport() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public Double getReadinessScore() { return readinessScore; }
    public void setReadinessScore(Double readinessScore) { this.readinessScore = readinessScore; }
    public String getReadinessBreakdown() { return readinessBreakdown; }
    public void setReadinessBreakdown(String readinessBreakdown) { this.readinessBreakdown = readinessBreakdown; }
    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }
    public String getSkillGaps() { return skillGaps; }
    public void setSkillGaps(String skillGaps) { this.skillGaps = skillGaps; }
    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
    public List<LearningRecommendation> getRecommendations() { return recommendations; }
    public void setRecommendations(List<LearningRecommendation> recommendations) { this.recommendations = recommendations; }
}
