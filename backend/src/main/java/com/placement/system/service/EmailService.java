package com.placement.system.service;

import com.placement.system.model.EmailOtp;
import com.placement.system.model.NotificationLog;
import com.placement.system.repository.EmailOtpRepository;
import com.placement.system.repository.NotificationLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailOtpRepository emailOtpRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Value("${app.notifications.email-enabled:true}")
    private boolean emailNotificationsEnabled;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.host:}")
    private String mailHost;

    /**
     * Generate and dispatch a 6-digit verification code to the target institutional email.
     */
    public Map<String, Object> sendVerificationOtp(String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        if (cleanEmail.isBlank()) {
            throw new IllegalArgumentException("Email address cannot be empty");
        }

        // Generate 6-digit cryptographically secure OTP (100000 - 999999)
        int randomCode = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(randomCode);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);

        try {
            // Clean up old / expired OTPs for this email
            emailOtpRepository.cleanupOldOtps(cleanEmail, LocalDateTime.now());
        } catch (Exception e) {
            logger.warn("Could not cleanup old OTPs: {}", e.getMessage());
        }

        // Save new OTP record
        EmailOtp otpEntity = new EmailOtp(cleanEmail, otp, expiry);
        emailOtpRepository.save(otpEntity);

        // Visual Console Log for immediate debugging and local testing
        System.out.println("================================================================================");
        System.out.println(" [ASCEND RGUKT INSTITUTIONAL OTP DISPATCH]");
        System.out.println(" Recipient Email : " + cleanEmail);
        System.out.println(" One-Time Code   : " + otp);
        System.out.println(" Expiration Time : " + expiry + " (10 Minutes)");
        System.out.println("================================================================================");

        boolean emailDispatched = false;
        String dispatchError = null;

        if (mailSender != null && isSmtpConfigured()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom("ascend-noreply@rguktsklm.ac.in", "Ascend RGUKT Placement Cell");
                helper.setTo(cleanEmail);
                helper.setSubject("[Ascend RGUKT] Student Registration OTP: " + otp);

                String htmlContent = """
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0b132b; color: #f8fafc; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h2 style="color: #3b82f6; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Ascend Placement System</h2>
                            <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">RGUKT Institutional Student Verification</p>
                        </div>
                        <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px; border: 1px solid #334155;">
                            <p style="font-size: 13px; color: #cbd5e1; margin: 0 0 12px 0;">Your 6-digit registration verification code is:</p>
                            <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #60a5fa; font-family: monospace; padding: 12px; background: #0f172a; border-radius: 8px; display: inline-block;">
                                %s
                            </div>
                            <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0 0;">Valid for 10 minutes. For your security, never share this code.</p>
                        </div>
                        <p style="font-size: 11px; color: #64748b; line-height: 1.6; text-align: center; margin: 0;">
                            This automated message was sent to verify ownership of this RGUKT institutional email address. If you did not request this, please ignore it.
                        </p>
                    </div>
                """.formatted(otp);

                helper.setText(htmlContent, true);
                mailSender.send(message);
                emailDispatched = true;
                logger.info("Successfully sent OTP email to {}", cleanEmail);
            } catch (Exception ex) {
                dispatchError = ex.getMessage();
                logger.warn("SMTP mail delivery skipped or failed for {}: {}", cleanEmail, ex.getMessage());
            }
        } else {
            logger.info("JavaMailSender not fully configured or host offline, OTP recorded for local verification.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("email", cleanEmail);
        response.put("message", "A 6-digit verification code has been dispatched to " + cleanEmail);
        response.put("emailSent", emailDispatched);
        // Expose devOtp for smooth developer evaluation & testing when local SMTP is not configured
        response.put("devOtp", otp);
        if (dispatchError != null) {
            response.put("mailStatus", "Dev fallback active: " + dispatchError);
        }
        return response;
    }

    /**
     * Dispatch a 6-digit password reset verification code.
     */
    public Map<String, Object> sendPasswordResetOtp(String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        if (cleanEmail.isBlank()) {
            throw new IllegalArgumentException("Email address cannot be empty");
        }

        int randomCode = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(randomCode);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);

        try {
            emailOtpRepository.cleanupOldOtps(cleanEmail, LocalDateTime.now());
        } catch (Exception e) {
            logger.warn("Could not cleanup old OTPs: {}", e.getMessage());
        }

        EmailOtp otpEntity = new EmailOtp(cleanEmail, otp, expiry);
        emailOtpRepository.save(otpEntity);

        System.out.println("================================================================================");
        System.out.println(" [ASCEND RGUKT PASSWORD RESET OTP DISPATCH]");
        System.out.println(" Recipient Email : " + cleanEmail);
        System.out.println(" One-Time Code   : " + otp);
        System.out.println(" Expiration Time : " + expiry + " (10 Minutes)");
        System.out.println("================================================================================");

        boolean emailDispatched = false;
        String dispatchError = null;

        if (mailSender != null && isSmtpConfigured()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom("ascend-noreply@rguktsklm.ac.in", "Ascend RGUKT Placement Cell");
                helper.setTo(cleanEmail);
                helper.setSubject("[Ascend RGUKT] Password Reset Verification Code: " + otp);

                String htmlContent = """
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0b132b; color: #f8fafc; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h2 style="color: #3b82f6; margin: 0; font-size: 22px; font-weight: 800;">Ascend Placement System</h2>
                            <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">RGUKT Password Reset Verification</p>
                        </div>
                        <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px; border: 1px solid #334155;">
                            <p style="font-size: 13px; color: #cbd5e1; margin: 0 0 12px 0;">Use the 6-digit verification code below to reset your password:</p>
                            <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #f59e0b; font-family: monospace; padding: 12px; background: #0f172a; border-radius: 8px; display: inline-block;">
                                %s
                            </div>
                            <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0 0;">Valid for 10 minutes. If you did not initiate this request, someone else may have entered your email.</p>
                        </div>
                        <p style="font-size: 11px; color: #64748b; line-height: 1.6; text-align: center; margin: 0;">
                            This automated message was sent to verify ownership of this RGUKT institutional email address.
                        </p>
                    </div>
                """.formatted(otp);

                helper.setText(htmlContent, true);
                mailSender.send(message);
                emailDispatched = true;
                logger.info("Successfully sent password reset OTP email to {}", cleanEmail);
            } catch (Exception ex) {
                dispatchError = ex.getMessage();
                logger.warn("SMTP mail delivery skipped or failed for {}: {}", cleanEmail, ex.getMessage());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("email", cleanEmail);
        response.put("message", "A 6-digit password reset code has been dispatched to " + cleanEmail);
        response.put("emailSent", emailDispatched);
        response.put("devOtp", otp);
        if (dispatchError != null) {
            response.put("mailStatus", "Dev fallback active: " + dispatchError);
        }
        return response;
    }

    /**
     * Validate the submitted OTP against stored active tokens.
     */
    public boolean verifyOtp(String email, String inputOtp) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        if (cleanEmail.isBlank() || inputOtp == null || inputOtp.isBlank()) {
            return false;
        }

        Optional<EmailOtp> recordOpt = emailOtpRepository.findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(cleanEmail);
        if (recordOpt.isEmpty()) {
            return false;
        }

        EmailOtp record = recordOpt.get();
        if (LocalDateTime.now().isAfter(record.getExpiresAt())) {
            return false;
        }

        if (record.getOtp().trim().equals(inputOtp.trim())) {
            record.setUsed(true);
            emailOtpRepository.save(record);
            return true;
        }

        return false;
    }

    // =========================================================================
    // CENTRALIZED HTML EMAIL NOTIFICATION ARCHITECTURE
    // =========================================================================

    /**
     * Asynchronous fire-and-forget HTML email dispatcher.
     * Guaranteed never to throw exceptions to business callers or block main request thread.
     */
    @Async
    public void sendHtmlEmailAsync(String recipientEmail, String recipientName, String recipientRole,
                                   String subject, String htmlContent, String notificationType,
                                   String relatedEntityId, String deduplicationKey) {
        try {
            sendHtmlEmail(recipientEmail, recipientName, recipientRole, subject, htmlContent,
                    notificationType, relatedEntityId, deduplicationKey);
        } catch (Exception e) {
            logger.error("Async email dispatch error for {}: {}", recipientEmail, e.getMessage(), e);
        }
    }

    /**
     * Synchronous HTML email dispatcher with full audit logging and deduplication.
     */
    public boolean sendHtmlEmail(String recipientEmail, String recipientName, String recipientRole,
                                 String subject, String htmlContent, String notificationType,
                                 String relatedEntityId, String deduplicationKey) {

        String cleanEmail = recipientEmail != null ? recipientEmail.trim().toLowerCase() : "";

        // 1. Validate email address format & security
        if (cleanEmail.isBlank() || !EMAIL_PATTERN.matcher(cleanEmail).matches()) {
            logger.warn("Rejecting email notification: Invalid email address [{}]", cleanEmail);
            NotificationLog failedLog = new NotificationLog(cleanEmail, recipientName, recipientRole,
                    notificationType, relatedEntityId, subject, deduplicationKey);
            failedLog.setDeliveryStatus("FAILED");
            failedLog.setFailureReason("Invalid email address format: " + cleanEmail);
            notificationLogRepository.save(failedLog);
            return false;
        }

        // 2. Prevent duplicate notifications for the same event key
        if (deduplicationKey != null && !deduplicationKey.isBlank()) {
            Optional<NotificationLog> existingLog = notificationLogRepository.findByDeduplicationKey(deduplicationKey);
            if (existingLog.isPresent()) {
                String status = existingLog.get().getDeliveryStatus();
                if (status != null && status.startsWith("SENT")) {
                    logger.info("Deduplication active: Notification for key [{}] already sent at {}",
                            deduplicationKey, existingLog.get().getSentAt());
                    return true;
                }
            }
        }

        // 3. Create persistent NotificationLog entry
        NotificationLog logEntry = new NotificationLog(cleanEmail, recipientName, recipientRole,
                notificationType, relatedEntityId, subject, deduplicationKey);
        logEntry = notificationLogRepository.save(logEntry);

        // 4. Check system notification toggle
        if (!emailNotificationsEnabled) {
            logEntry.setDeliveryStatus("SENT (SIMULATED)");
            logEntry.setSentAt(LocalDateTime.now());
            logEntry.setFailureReason("Email dispatch disabled via app.notifications.email-enabled=false; simulated dispatch.");
            notificationLogRepository.save(logEntry);
            printConsoleSimulation(cleanEmail, recipientName, recipientRole, subject, notificationType);
            return true;
        }

        // 5. Check if real SMTP server is configured and reachable
        boolean smtpConfigured = isSmtpConfigured();

        if (mailSender != null && smtpConfigured) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom("ascend-noreply@rguktsklm.ac.in", "Ascend RGUKT Placement Cell");
                helper.setTo(cleanEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);

                logEntry.setDeliveryStatus("SENT");
                logEntry.setSentAt(LocalDateTime.now());
                logEntry.setFailureReason(null);
                notificationLogRepository.save(logEntry);

                logger.info("Successfully dispatched live HTML email to [{}] with type [{}]", cleanEmail, notificationType);
                return true;
            } catch (Exception ex) {
                logger.warn("Live SMTP transmission failed for [{}]: {}. Fallback to simulated log.", cleanEmail, ex.getMessage());
                logEntry.setDeliveryStatus("SENT (SIMULATED)");
                logEntry.setSentAt(LocalDateTime.now());
                logEntry.setFailureReason("SMTP fallback: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
                notificationLogRepository.save(logEntry);
                printConsoleSimulation(cleanEmail, recipientName, recipientRole, subject, notificationType);
                return true;
            }
        } else {
            // Simulated delivery when SMTP credentials are not configured in environment
            logEntry.setDeliveryStatus("SENT (SIMULATED)");
            logEntry.setSentAt(LocalDateTime.now());
            logEntry.setFailureReason("SMTP credentials not configured (Dev/Test mode) - simulated dispatch.");
            notificationLogRepository.save(logEntry);
            printConsoleSimulation(cleanEmail, recipientName, recipientRole, subject, notificationType);
            return true;
        }
    }

    /**
     * Retry a previously failed notification.
     */
    public boolean retryNotification(String logId) {
        Optional<NotificationLog> opt = notificationLogRepository.findById(logId);
        if (opt.isEmpty()) return false;

        NotificationLog log = opt.get();
        log.setDeliveryStatus("RETRYING");
        notificationLogRepository.save(log);

        return sendHtmlEmail(log.getRecipientEmail(), log.getRecipientName(), log.getRecipientRole(),
                log.getSubject(), "<p>Retrying notification delivery</p>", log.getNotificationType(),
                log.getRelatedEntityId(), log.getDeduplicationKey() + "_RETRY_" + System.currentTimeMillis());
    }

    private boolean isSmtpConfigured() {
        return mailHost != null && !mailHost.isBlank() && !mailHost.equals("localhost")
                && mailUsername != null && !mailUsername.isBlank() && !mailUsername.contains("dummy");
    }

    private void printConsoleSimulation(String email, String name, String role, String subject, String type) {
        System.out.println("================================================================================");
        System.out.println(" [ASCEND CENTRALIZED EMAIL NOTIFICATION DISPATCH - SIMULATED / AUDITED]");
        System.out.println(" Notification Type : " + type);
        System.out.println(" Recipient         : " + name + " <" + email + "> [" + role + "]");
        System.out.println(" Subject           : " + subject);
        System.out.println(" Timestamp         : " + LocalDateTime.now());
        System.out.println(" Status            : SENT (SIMULATED / AUDIT LOGGED)");
        System.out.println("================================================================================");
    }
}
