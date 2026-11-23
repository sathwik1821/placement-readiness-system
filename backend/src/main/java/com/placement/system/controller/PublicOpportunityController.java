package com.placement.system.controller;

import com.placement.system.model.RecruiterOpportunity;
import com.placement.system.repository.RecruiterOpportunityRepository;
import com.placement.system.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/public/opportunities")
public class PublicOpportunityController {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Autowired
    private RecruiterOpportunityRepository opportunityRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Public endpoint: External recruiters submit placement opportunities without logging in.
     */
    @PostMapping
    public ResponseEntity<?> submitOpportunity(@RequestBody Map<String, Object> body) {
        String companyName = (String) body.get("companyName");
        String recruiterName = (String) body.get("recruiterName");
        String recruiterEmail = (String) body.get("recruiterEmail");
        String jobRole = (String) body.get("jobRole");

        if (companyName == null || companyName.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Company name is required"));
        }
        if (recruiterName == null || recruiterName.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recruiter contact name is required"));
        }
        if (recruiterEmail == null || !EMAIL_PATTERN.matcher(recruiterEmail.trim()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A valid recruiter corporate email is required"));
        }
        if (jobRole == null || jobRole.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Designated job role is required"));
        }

        // Generate unique institutional reference identifier: ASC-OPP-2026-XXXXX
        int randomCode = 10000 + RANDOM.nextInt(90000);
        String referenceId = "ASC-OPP-" + LocalDateTime.now().getYear() + "-" + randomCode;

        RecruiterOpportunity opp = new RecruiterOpportunity();
        opp.setReferenceId(referenceId);
        opp.setCompanyName(companyName.trim());
        opp.setRecruiterName(recruiterName.trim());
        opp.setRecruiterEmail(recruiterEmail.trim().toLowerCase());
        opp.setRecruiterPhone((String) body.getOrDefault("recruiterPhone", ""));
        opp.setJobTitle((String) body.getOrDefault("jobTitle", jobRole));
        opp.setJobRole(jobRole.trim());
        opp.setCtc((String) body.getOrDefault("ctc", "Competitive"));
        opp.setWorkMode((String) body.getOrDefault("workMode", "ONSITE"));
        opp.setLocation((String) body.getOrDefault("location", "Campus / Hybrid"));
        opp.setJobDescription((String) body.getOrDefault("jobDescription", ""));
        opp.setEligibilityCriteria((String) body.getOrDefault("eligibilityCriteria", "{}"));

        if (body.get("deadline") != null) {
            try {
                String dStr = body.get("deadline").toString().trim();
                if (dStr.length() == 10) {
                    opp.setDeadline(java.time.LocalDate.parse(dStr).atTime(23, 59, 59));
                } else {
                    opp.setDeadline(LocalDateTime.parse(dStr));
                }
            } catch (Exception ignored) {}
        }

        opp.setStatus("SUBMITTED");
        opp = opportunityRepository.save(opp);

        // Trigger notifications: confirmation to recruiter & review alert to Admin
        notificationService.notifyRecruiterOpportunitySubmitted(opp);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "referenceId", opp.getReferenceId(),
                "id", opp.getId(),
                "message", "Your placement requisition has been received and queued for review.",
                "companyName", opp.getCompanyName(),
                "status", opp.getStatus()
        ));
    }

    /**
     * Public endpoint: Validate secure response token for recruiter clarification link.
     */
    @GetMapping("/respond")
    public ResponseEntity<?> validateResponseToken(@RequestParam("token") String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Security token is required"));
        }

        Optional<RecruiterOpportunity> opt = opportunityRepository.findBySecureToken(token.trim());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Invalid or already consumed response token"));
        }

        RecruiterOpportunity opp = opt.get();
        if (opp.getTokenExpiry() != null && LocalDateTime.now().isAfter(opp.getTokenExpiry())) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("error", "This response link has expired"));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "referenceId", opp.getReferenceId(),
                "companyName", opp.getCompanyName(),
                "jobRole", opp.getJobRole(),
                "adminFeedback", opp.getAdminFeedback() != null ? opp.getAdminFeedback() : ""
        ));
    }

    /**
     * Public endpoint: Recruiter submits additional information using single-use secure token.
     */
    @PostMapping("/respond")
    public ResponseEntity<?> submitClarification(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String response = body.get("response");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Security token is required"));
        }
        if (response == null || response.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Clarification response text cannot be empty"));
        }

        Optional<RecruiterOpportunity> opt = opportunityRepository.findBySecureToken(token.trim());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Invalid or already consumed response token"));
        }

        RecruiterOpportunity opp = opt.get();
        if (opp.getTokenExpiry() != null && LocalDateTime.now().isAfter(opp.getTokenExpiry())) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("error", "This response link has expired"));
        }

        // Record recruiter response, invalidate token, and put back in SUBMITTED review state
        opp.setRecruiterResponse(response.trim());
        opp.setStatus("SUBMITTED");
        opp.setSecureToken(null);
        opp.setTokenExpiry(null);
        opp.setUpdatedAt(LocalDateTime.now());
        opportunityRepository.save(opp);

        // Alert Admin that clarification was received
        notificationService.notifyAdminOpportunityReviewRequired(opp);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "referenceId", opp.getReferenceId(),
                "message", "Your response has been registered. The placement cell will resume review."
        ));
    }
}
