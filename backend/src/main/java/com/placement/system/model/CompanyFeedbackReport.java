package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_feedback_reports")
public class CompanyFeedbackReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String driveId;

    @Column(nullable = false)
    private String officerId;

    private String companyId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String reportData = "{}";

    private LocalDateTime generatedAt = LocalDateTime.now();

    public CompanyFeedbackReport() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDriveId() { return driveId; }
    public void setDriveId(String driveId) { this.driveId = driveId; }
    public String getOfficerId() { return officerId; }
    public void setOfficerId(String officerId) { this.officerId = officerId; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getReportData() { return reportData; }
    public void setReportData(String reportData) { this.reportData = reportData; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
