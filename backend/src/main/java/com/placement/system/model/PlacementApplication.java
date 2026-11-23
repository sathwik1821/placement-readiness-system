package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"studentId", "driveId"})
}, indexes = {
    @Index(columnList = "studentId"),
    @Index(columnList = "driveId")
})
public class PlacementApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String driveId;

    private LocalDateTime appliedAt = LocalDateTime.now();
    private String status = "APPLIED"; // APPLIED, ASSESSMENT_PENDING, ASSESSMENT_COMPLETED, SHORTLISTED, INTERVIEW_SCHEDULED, SELECTED, NOT_SELECTED
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String resumeUrl = "";

    private String resumeFileName = "";

    @Version
    private Long version;

    @Transient
    private PlacementDrive drive;

    @Transient
    private Student student;

    public PlacementApplication() {}

    public PlacementApplication(String studentId, String driveId) {
        this.studentId = studentId;
        this.driveId = driveId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getDriveId() { return driveId; }
    public void setDriveId(String driveId) { this.driveId = driveId; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
    public PlacementDrive getDrive() { return drive; }
    public void setDrive(PlacementDrive drive) { this.drive = drive; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
}
