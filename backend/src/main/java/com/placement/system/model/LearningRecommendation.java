package com.placement.system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "learning_recommendations")
public class LearningRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String analysisReportId;

    private String skillGap;
    private String resourceType; // VIDEO, ARTICLE, PRACTICE, COURSE
    private String title;
    private String url;
    private String priority = "MEDIUM";

    public LearningRecommendation() {}

    public LearningRecommendation(String analysisReportId, String skillGap, String resourceType, String title, String url, String priority) {
        this.analysisReportId = analysisReportId;
        this.skillGap = skillGap;
        this.resourceType = resourceType;
        this.title = title;
        this.url = url;
        this.priority = priority;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAnalysisReportId() { return analysisReportId; }
    public void setAnalysisReportId(String analysisReportId) { this.analysisReportId = analysisReportId; }
    public String getSkillGap() { return skillGap; }
    public void setSkillGap(String skillGap) { this.skillGap = skillGap; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
