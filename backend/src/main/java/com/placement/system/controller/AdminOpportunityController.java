package com.placement.system.controller;

import com.placement.system.model.RecruiterOpportunity;
import com.placement.system.repository.RecruiterOpportunityRepository;
import com.placement.system.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/opportunities")
public class AdminOpportunityController {

    @Autowired
    private RecruiterOpportunityRepository opportunityRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getOpportunities(@RequestParam(value = "status", required = false) String status) {
        List<RecruiterOpportunity> list;
        if (status != null && !status.isBlank()) {
            list = opportunityRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        } else {
            list = opportunityRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOpportunityById(@PathVariable String id) {
        return opportunityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<?> reviewOpportunity(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        RecruiterOpportunity opp = opportunityRepository.findById(id).orElse(null);
        if (opp == null) {
            return ResponseEntity.notFound().build();
        }

        String action = body.get("action");
        String feedback = body.get("feedback");

        if (action == null || action.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Action (APPROVE, REJECT, REQUEST_INFO) is required"));
        }

        switch (action.toUpperCase().trim()) {
            case "APPROVE":
                opp.setStatus("APPROVED_FOR_TPO");
                opp.setAdminFeedback(feedback != null ? feedback.trim() : "Approved by administrator for TPO scheduling.");
                opp.setUpdatedAt(LocalDateTime.now());
                opp = opportunityRepository.save(opp);

                // Notify TPO office that this opportunity is ready for scheduling & publishing
                notificationService.notifyTpoOpportunityRequiresApproval(opp);
                break;

            case "REJECT":
                opp.setStatus("REJECTED_BY_ADMIN");
                opp.setAdminFeedback(feedback != null ? feedback.trim() : "Submission does not meet campus recruitment guidelines.");
                opp.setUpdatedAt(LocalDateTime.now());
                opp = opportunityRepository.save(opp);

                // Notify recruiter with explanation
                notificationService.notifyRecruiterOpportunityDecision(opp, "REJECTED_BY_ADMIN", opp.getAdminFeedback());
                break;

            case "REQUEST_INFO":
                if (feedback == null || feedback.trim().isBlank()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Feedback explanation is required when requesting information"));
                }
                String token = UUID.randomUUID().toString();
                opp.setSecureToken(token);
                opp.setTokenExpiry(LocalDateTime.now().plusDays(7));
                opp.setStatus("INFO_REQUESTED");
                opp.setAdminFeedback(feedback.trim());
                opp.setUpdatedAt(LocalDateTime.now());
                opp = opportunityRepository.save(opp);

                // Email recruiter with single-use secure response link
                notificationService.notifyRecruiterOpportunityDecision(opp, "INFO_REQUESTED", opp.getAdminFeedback());
                break;

            default:
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported action: " + action));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "opportunity", opp,
                "action", action.toUpperCase().trim()
        ));
    }
}
