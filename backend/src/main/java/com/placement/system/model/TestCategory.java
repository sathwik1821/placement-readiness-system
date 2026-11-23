package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_categories")
public class TestCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String type = "TECHNICAL"; // COMMON, TECHNICAL, MOCK, ASSIGNMENT
    private String domain = "";
    
    @Column(columnDefinition = "TEXT")
    private String description = "";

    @Column(columnDefinition = "TEXT")
    private String targetYears = "[]"; // JSON array of integers, e.g. [1, 2, 3, 4] or empty [] for all

    @Column(columnDefinition = "TEXT")
    private String targetDepartments = "[]"; // JSON array of department codes: ["CSE", "ECE"] or empty [] for all

    private Integer durationMinutes = 30;
    private Double passingPercentage = 60.0;
    private Boolean isActive = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public TestCategory() {}

    public TestCategory(String name, String type, String domain, String description) {
        this.name = name;
        this.type = type;
        this.domain = domain;
        this.description = description;
        this.targetYears = "[]";
        this.targetDepartments = "[]";
        this.durationMinutes = 30;
        this.passingPercentage = 60.0;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public TestCategory(String name, String type, String domain, String description, String targetYears, String targetDepartments, Integer durationMinutes, Double passingPercentage) {
        this.name = name;
        this.type = type;
        this.domain = domain;
        this.description = description;
        this.targetYears = targetYears != null ? targetYears : "[]";
        this.targetDepartments = targetDepartments != null ? targetDepartments : "[]";
        this.durationMinutes = durationMinutes != null ? durationMinutes : 30;
        this.passingPercentage = passingPercentage != null ? passingPercentage : 60.0;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTargetYears() { return targetYears; }
    public void setTargetYears(String targetYears) { this.targetYears = targetYears; }
    public String getTargetDepartments() { return targetDepartments; }
    public void setTargetDepartments(String targetDepartments) { this.targetDepartments = targetDepartments; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Double getPassingPercentage() { return passingPercentage; }
    public void setPassingPercentage(Double passingPercentage) { this.passingPercentage = passingPercentage; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
