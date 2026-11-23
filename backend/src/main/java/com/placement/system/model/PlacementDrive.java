package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_drives")
public class PlacementDrive {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String companyId;

    @Column(nullable = false)
    private String officerId;

    private String title;
    private String jobRole;
    private String ctc = "";
    private String workMode = "ONSITE"; // ONSITE, REMOTE, HYBRID

    @Column(columnDefinition = "TEXT")
    private String jobDescription = "";

    private String location = "";
    private LocalDateTime deadline;
    private String status = "PUBLISHED"; // DRAFT, PUBLISHED, CLOSED

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria = "{}";

    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    private Boolean isEligible = true;

    @Transient
    private Object eligibilityDetails;

    public PlacementDrive() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getOfficerId() { return officerId; }
    public void setOfficerId(String officerId) { this.officerId = officerId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }
    public String getCtc() { return ctc; }
    public void setCtc(String ctc) { this.ctc = ctc; }
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsEligible() { return isEligible; }
    public void setIsEligible(Boolean isEligible) { this.isEligible = isEligible; }
    public Object getEligibilityDetails() { return eligibilityDetails; }
    public void setEligibilityDetails(Object eligibilityDetails) { this.eligibilityDetails = eligibilityDetails; }
}
