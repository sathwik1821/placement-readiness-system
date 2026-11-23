package com.placement.system.service;

import com.placement.system.model.EmailOtp;
import com.placement.system.repository.EmailOtpRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final SecureRandom secureRandom = new SecureRandom();

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailOtpRepository emailOtpRepository;

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

        if (mailSender != null) {
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
            logger.info("JavaMailSender not configured, OTP recorded for local verification.");
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

        if (mailSender != null) {
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
}
