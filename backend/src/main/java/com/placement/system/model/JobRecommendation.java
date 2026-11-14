package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_recommendations")
public class JobRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String jobId;

    private Double matchScore = 0.0;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String matchReasons = "[]";

    private LocalDateTime recommendedAt = LocalDateTime.now();

    @Transient
    private Job job;

    public JobRecommendation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }
    public String getMatchReasons() { return matchReasons; }
    public void setMatchReasons(String matchReasons) { this.matchReasons = matchReasons; }
    public LocalDateTime getRecommendedAt() { return recommendedAt; }
    public void setRecommendedAt(LocalDateTime recommendedAt) { this.recommendedAt = recommendedAt; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
}
