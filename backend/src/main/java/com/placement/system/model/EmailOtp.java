package com.placement.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_otps", indexes = {
    @Index(name = "idx_email_otps_email", columnList = "email")
})
public class EmailOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean isUsed = false;

    public EmailOtp() {}

    public EmailOtp(String email, String otp, LocalDateTime expiresAt) {
        this.email = email != null ? email.trim().toLowerCase() : "";
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
        this.isUsed = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }
}
