package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs", indexes = {
    @Index(name = "idx_notif_log_recipient", columnList = "recipientEmail"),
    @Index(name = "idx_notif_log_type", columnList = "notificationType"),
    @Index(name = "idx_notif_log_dedup", columnList = "deduplicationKey"),
    @Index(name = "idx_notif_log_status", columnList = "deliveryStatus"),
    @Index(name = "idx_notif_log_created", columnList = "createdAt")
})
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String recipientEmail;

    private String recipientName = "";
    private String recipientRole = "STUDENT"; // STUDENT, RECRUITER, TPO, ADMIN

    @Column(nullable = false)
    private String notificationType; // DRIVE_PUBLISHED, APPLICATION_SUBMITTED, etc.

    private String relatedEntityId = "";
    private String subject;

    @Column(nullable = false)
    private String deliveryStatus = "PENDING"; // PENDING, SENT, FAILED, RETRYING

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    @Column(unique = false)
    private String deduplicationKey;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime sentAt;

    public NotificationLog() {}

    public NotificationLog(String recipientEmail, String recipientName, String recipientRole,
                           String notificationType, String relatedEntityId, String subject,
                           String deduplicationKey) {
        this.recipientEmail = recipientEmail;
        this.recipientName = recipientName != null ? recipientName : "";
        this.recipientRole = recipientRole != null ? recipientRole : "STUDENT";
        this.notificationType = notificationType;
        this.relatedEntityId = relatedEntityId != null ? relatedEntityId : "";
        this.subject = subject;
        this.deduplicationKey = deduplicationKey;
        this.deliveryStatus = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public String getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    public String getDeduplicationKey() { return deduplicationKey; }
    public void setDeduplicationKey(String deduplicationKey) { this.deduplicationKey = deduplicationKey; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
