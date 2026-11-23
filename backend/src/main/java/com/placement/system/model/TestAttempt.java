package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_attempts", indexes = {
    @Index(columnList = "studentId"),
    @Index(columnList = "testCategoryId")
})
public class TestAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String testCategoryId;

    private LocalDateTime startedAt = LocalDateTime.now();
    private LocalDateTime completedAt;
    private Double totalScore = 0.0;
    private Integer totalMarks = 0;
    private Double percentageScore = 0.0;
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED, LATE_SUBMISSION
    private Integer timeLimitSeconds = 1200; // 20 minutes default

    @Version
    private Long version;

    @Transient
    private TestCategory category;

    public TestAttempt() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getTestCategoryId() { return testCategoryId; }
    public void setTestCategoryId(String testCategoryId) { this.testCategoryId = testCategoryId; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Double getTotalScore() { return totalScore; }
    public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Double getPercentageScore() { return percentageScore; }
    public void setPercentageScore(Double percentageScore) { this.percentageScore = percentageScore; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTimeLimitSeconds() { return timeLimitSeconds; }
    public void setTimeLimitSeconds(Integer timeLimitSeconds) { this.timeLimitSeconds = timeLimitSeconds; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public TestCategory getCategory() { return category; }
    public void setCategory(TestCategory category) { this.category = category; }
}
