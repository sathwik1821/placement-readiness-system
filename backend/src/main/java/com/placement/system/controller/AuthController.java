package com.placement.system.controller;

import com.placement.system.dto.LoginRequestDto;
import com.placement.system.dto.LoginResponseDto;
import com.placement.system.dto.PasswordResetDto;
import com.placement.system.dto.StudentRegisterDto;
import com.placement.system.service.AuthService;
import com.placement.system.service.EmailService;
import com.placement.system.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtService jwtService;

    private final java.util.concurrent.ConcurrentHashMap<String, Long> lastOtpRequestTime = new java.util.concurrent.ConcurrentHashMap<>();

    private Long checkRateLimit(String email) {
        if (lastOtpRequestTime.size() > 10_000) lastOtpRequestTime.clear();
        long now = System.currentTimeMillis();
        Long lastTime = lastOtpRequestTime.get(email);
        if (lastTime != null && (now - lastTime) < 45_000) {
            return Math.max(1, (45_000 - (now - lastTime)) / 1000);
        }
        lastOtpRequestTime.put(email, now);
        return null;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        String cleanEmail = email.trim().toLowerCase();
        Long remainingCooldown = checkRateLimit(cleanEmail);
        if (remainingCooldown != null) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded. Please wait " + remainingCooldown + "s before requesting a new OTP."));
        }
        try {
            Map<String, Object> res = emailService.sendVerificationOtp(cleanEmail);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send verification OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        if (email == null || otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }
        boolean valid = emailService.verifyOtp(email.trim().toLowerCase(), otp.trim());
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification OTP. Please request a new code."));
        }
        return ResponseEntity.ok(Map.of("valid", true, "message", "Email ownership successfully verified"));
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendForgotPasswordOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email address is required"));
        }
        String cleanEmail = email.trim().toLowerCase();
        Long remainingCooldown = checkRateLimit("FORGOT_" + cleanEmail);
        if (remainingCooldown != null) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded. Please wait " + remainingCooldown + "s before requesting another reset code."));
        }
        try {
            Map<String, Object> res = emailService.sendPasswordResetOtp(cleanEmail);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to dispatch password reset OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetDto payload) {
        try {
            authService.resetPassword(payload);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password has been successfully reset! Please sign in with your new password."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto payload) {
        try {
            LoginResponseDto response = authService.login(payload);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        String role = (String) payload.getOrDefault("role", "STUDENT");
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String name = (String) payload.get("name");

        try {
            if ("STUDENT".equalsIgnoreCase(role)) {
                StudentRegisterDto dto = new StudentRegisterDto();
                dto.setEmail(email);
                dto.setPassword(password);
                dto.setConfirmPassword((String) payload.get("confirmPassword"));
                dto.setName(name);
                dto.setRollNumber((String) payload.get("rollNumber"));
                dto.setDepartment((String) payload.getOrDefault("department", "Computer Science & Engineering"));
                if (payload.get("graduationYear") != null) {
                    dto.setGraduationYear(((Number) payload.get("graduationYear")).intValue());
                }
                return ResponseEntity.ok(authService.registerStudent(dto));
            } else if ("PLACEMENT_OFFICER".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(authService.registerOfficer(email, password, name, (String) payload.get("department")));
            } else if ("COMPANY".equalsIgnoreCase(role)) {
                String companyName = (String) payload.getOrDefault("companyName", name);
                return ResponseEntity.ok(authService.registerCompany(email, password, companyName, name));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported registration role: " + role));
            }
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
            return ResponseEntity.ok(authService.getCurrentUserProfile(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Session invalid"));
        }
    }
}
