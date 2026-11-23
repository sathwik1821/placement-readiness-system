package com.placement.system.controller;

import com.placement.system.model.CareerGoal;
import com.placement.system.model.Student;
import com.placement.system.model.User;
import com.placement.system.repository.CareerGoalRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.repository.UserRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private com.placement.system.service.EmailService emailService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        email = email.trim().toLowerCase();

        if (!com.placement.system.util.RguktUtils.isRguktStudentEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Student registration is exclusively restricted to RGUKT institutional candidates. Please use your official RGUKT email (e.g. s210018@rguktsklm.ac.in for 2027 batch, s22... for 2028 batch)."
            ));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this RGUKT email is already registered. Please sign in instead."));
        }

        try {
            Map<String, Object> res = emailService.sendVerificationOtp(email);
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
        email = email.trim().toLowerCase();
        boolean valid = emailService.verifyOtp(email, otp);
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
        email = email.trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "No registered account found with email: " + email + ". Please check spelling or register first."
            ));
        }

        try {
            Map<String, Object> res = emailService.sendPasswordResetOtp(email);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to dispatch password reset OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");
        String confirmPassword = payload.get("confirmPassword");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email address is required"));
        }
        email = email.trim().toLowerCase();

        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Verification OTP code is required"));
        }

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must contain at least 6 characters"));
        }

        if (confirmPassword != null && !confirmPassword.equals(newPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match. Please verify both password entries."));
        }

        boolean isOtpValid = emailService.verifyOtp(email, otp.trim());
        if (!isOtpValid) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification OTP. Please request a new code."));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User account not found"));
        }

        user.setPassword(newPassword);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Password has been successfully reset! Please sign in with your new password."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password credentials"));
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of("token", token, "role", user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String confirmPassword = (String) payload.get("confirmPassword");
        String role = (String) payload.get("role");
        String name = (String) payload.get("name");
        String otp = (String) payload.get("otp");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        email = email.trim().toLowerCase();

        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must contain at least 6 characters."));
        }

        if (confirmPassword != null && !confirmPassword.equals(password)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match. Please ensure both password fields are identical."));
        }

        if ("STUDENT".equalsIgnoreCase(role)) {
            if (!com.placement.system.util.RguktUtils.isRguktStudentEmail(email)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Student registration is exclusively restricted to RGUKT institutional candidates. Please use your official RGUKT institutional email (e.g. s210018@rguktsklm.ac.in for 2027 batch, s22... for 2028 batch)."
                ));
            }

            // Require and verify email OTP for all student self-registrations
            if (otp == null || otp.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email verification OTP is required to confirm institutional email ownership."
                ));
            }

            boolean isOtpValid = emailService.verifyOtp(email, otp.trim());
            if (!isOtpValid) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid or expired verification OTP. Please enter the valid 6-digit code dispatched to your email."
                ));
            }
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered in system. Please sign in instead."));
        }

        User user = userRepository.save(new User(email, password, role));

        if ("STUDENT".equalsIgnoreCase(role)) {
            com.placement.system.util.RguktUtils.RguktStudentInfo info = com.placement.system.util.RguktUtils.parseStudentEmail(email);
            Student student = new Student();
            student.setUserId(user.getId());
            student.setEmail(email);
            if (info != null) {
                student.setRollNumber(info.getRollNumber());
                student.setCollege(info.getCollege());
                student.setBatch(info.getBatch());
                student.setYear(info.getYear());
                student.setYearOfStudy(info.getYearOfStudy());
                student.setGraduationYear(info.getGraduationYear());
                student.setSemester(info.getGraduationYear() == 2027 ? 8 : (info.getGraduationYear() == 2028 ? 6 : 8));
                student.setName(name != null && !name.isBlank() ? name : "Student (" + info.getRollNumber() + ")");
            } else {
                student.setName(name != null && !name.isBlank() ? name : email.split("@")[0]);
                student.setYear(4);
                student.setYearOfStudy("4th Year (E4)");
            }
            String dept = (String) payload.get("department");
            student.setDepartment(dept != null && !dept.isBlank() ? dept : "Computer Science & Engineering");
            student = studentRepository.save(student);

            CareerGoal goal = new CareerGoal();
            goal.setStudentId(student.getId());
            goal.setTargetRole("Java Full Stack Developer");
            goal.setTargetDomain("Distributed Systems");
            goal.setTargetIndustry("Information Technology");
            careerGoalRepository.save(goal);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of("token", token, "role", user.getRole()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("createdAt", user.getCreatedAt());

        if ("STUDENT".equals(user.getRole())) {
            studentRepository.findByUserId(user.getId()).ifPresent(s -> {
                response.put("student", s);
                careerGoalRepository.findByStudentId(s.getId()).ifPresent(g -> response.put("careerGoal", g));
            });
        }

        return ResponseEntity.ok(response);
    }
}
