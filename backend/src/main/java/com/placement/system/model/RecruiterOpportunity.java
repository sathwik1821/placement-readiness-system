package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recruiter_opportunities", indexes = {
    @Index(name = "idx_opp_ref_id", columnList = "referenceId", unique = true),
    @Index(name = "idx_opp_token", columnList = "secureToken"),
    @Index(name = "idx_opp_status", columnList = "status"),
    @Index(name = "idx_opp_email", columnList = "recruiterEmail")
})
public class RecruiterOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String referenceId; // e.g. ASC-OPP-2026-48291

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String recruiterName;

    @Column(nullable = false)
    private String recruiterEmail;

    private String recruiterPhone = "";
    private String jobTitle;
    private String jobRole;
    private String ctc = "Competitive";
    private String workMode = "ONSITE"; // ONSITE, REMOTE, HYBRID
    private String location = "Campus / Hybrid";

    @Column(columnDefinition = "TEXT")
    private String jobDescription = "";

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria = "{}";

    private LocalDateTime deadline;

    /**
     * Workflow Status:
     * - SUBMITTED: Fresh recruiter submission awaiting Admin review
     * - INFO_REQUESTED: Admin requested clarification from recruiter
     * - APPROVED_FOR_TPO: Admin verified and passed to TPO for final scheduling/publishing
     * - REJECTED_BY_ADMIN: Admin rejected submission with rationale
     * - PUBLISHED: TPO officially created and published a placement drive on Ascend
     * - REJECTED_BY_TPO: TPO decided not to publish
     */
    @Column(nullable = false)
    private String status = "SUBMITTED";

    @Column(columnDefinition = "TEXT")
    private String adminFeedback = "";

    @Column(columnDefinition = "TEXT")
    private String recruiterResponse = "";

    @Column(unique = true)
    private String secureToken; // Single-use secure token for response link

    private LocalDateTime tokenExpiry;

    private String publishedDriveId; // Populated when official drive is published

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public RecruiterOpportunity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }
    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }
    public String getRecruiterPhone() { return recruiterPhone; }
    public void setRecruiterPhone(String recruiterPhone) { this.recruiterPhone = recruiterPhone; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }
    public String getCtc() { return ctc; }
    public void setCtc(String ctc) { this.ctc = ctc; }
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminFeedback() { return adminFeedback; }
    public void setAdminFeedback(String adminFeedback) { this.adminFeedback = adminFeedback; }
    public String getRecruiterResponse() { return recruiterResponse; }
    public void setRecruiterResponse(String recruiterResponse) { this.recruiterResponse = recruiterResponse; }
    public String getSecureToken() { return secureToken; }
    public void setSecureToken(String secureToken) { this.secureToken = secureToken; }
    public LocalDateTime getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(LocalDateTime tokenExpiry) { this.tokenExpiry = tokenExpiry; }
    public String getPublishedDriveId() { return publishedDriveId; }
    public void setPublishedDriveId(String publishedDriveId) { this.publishedDriveId = publishedDriveId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
