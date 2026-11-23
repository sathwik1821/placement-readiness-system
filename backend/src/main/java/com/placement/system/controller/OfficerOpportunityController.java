package com.placement.system.controller;

import com.placement.system.model.PlacementDrive;
import com.placement.system.model.PlacementOfficer;
import com.placement.system.model.RecruiterOpportunity;
import com.placement.system.repository.PlacementDriveRepository;
import com.placement.system.repository.PlacementOfficerRepository;
import com.placement.system.repository.RecruiterOpportunityRepository;
import com.placement.system.service.JwtService;
import com.placement.system.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officer")
public class OfficerOpportunityController {

    @Autowired
    private RecruiterOpportunityRepository opportunityRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private PlacementOfficerRepository officerRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired(required = false)
    private JwtService jwtService;

    /**
     * TPO retrieves recruiter opportunities forwarded by Admin.
     */
    @GetMapping("/opportunities")
    public ResponseEntity<?> getTpoOpportunities(
            @RequestParam(value = "status", required = false) String status) {

        List<RecruiterOpportunity> list;
        if (status != null && !status.isBlank()) {
            list = opportunityRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        } else {
            // By default return opportunities ready for TPO action
            list = opportunityRepository.findByStatusOrderByCreatedAtDesc("APPROVED_FOR_TPO");
            if (list.isEmpty()) {
                list = opportunityRepository.findAllByOrderByCreatedAtDesc();
            }
        }
        return ResponseEntity.ok(list);
    }

    /**
     * TPO officially converts a verified recruiter opportunity into a published campus drive.
     */
    @PostMapping("/opportunities/{id}/publish")
    public ResponseEntity<?> publishOpportunityAsDrive(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) Map<String, Object> body) {

        RecruiterOpportunity opp = opportunityRepository.findById(id).orElse(null);
        if (opp == null) {
            return ResponseEntity.notFound().build();
        }

        // Resolve officer ID if available
        String officerId = "default-officer";
        if (authHeader != null && authHeader.startsWith("Bearer ") && jwtService != null) {
            try {
                String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
                PlacementOfficer officer = officerRepository.findByUserId(userId).orElse(null);
                if (officer != null) officerId = officer.getId();
            } catch (Exception ignored) {}
        }

        // Create official PlacementDrive
        PlacementDrive drive = new PlacementDrive();
        drive.setOfficerId(officerId);
        drive.setTitle(opp.getCompanyName());
        drive.setJobRole(opp.getJobRole());
        drive.setCtc(opp.getCtc() != null ? opp.getCtc() : "Competitive");
        drive.setWorkMode(opp.getWorkMode() != null ? opp.getWorkMode() : "ONSITE");
        drive.setLocation(opp.getLocation() != null ? opp.getLocation() : "Campus / Hybrid");
        drive.setJobDescription(opp.getJobDescription() != null ? opp.getJobDescription() : "");
        drive.setEligibilityCriteria(opp.getEligibilityCriteria() != null ? opp.getEligibilityCriteria() : "{}");
        drive.setDeadline(opp.getDeadline());
        drive.setStatus("PUBLISHED");

        // Allow overriding deadline or eligibility criteria in TPO publish payload
        if (body != null) {
            if (body.get("deadline") != null) {
                try {
                    String dStr = body.get("deadline").toString().trim();
                    if (dStr.length() == 10) {
                        drive.setDeadline(java.time.LocalDate.parse(dStr).atTime(23, 59, 59));
                    } else {
                        drive.setDeadline(LocalDateTime.parse(dStr));
                    }
                } catch (Exception ignored) {}
            }
            if (body.get("eligibilityCriteria") != null) {
                drive.setEligibilityCriteria(body.get("eligibilityCriteria").toString());
            }
        }

        drive = driveRepository.save(drive);

        // Update RecruiterOpportunity record
        opp.setStatus("PUBLISHED");
        opp.setPublishedDriveId(drive.getId());
        opp.setUpdatedAt(LocalDateTime.now());
        opportunityRepository.save(opp);

        // 1. Notify recruiter that their opportunity is published
        notificationService.notifyRecruiterOpportunityDecision(opp, "PUBLISHED", "Campus drive successfully published on Ascend.");

        // 2. Broadcast drive to all eligible RGUKT students
        notificationService.notifyDrivePublished(drive);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "drive", drive,
                "opportunity", opp,
                "message", "Opportunity successfully published as an official campus drive."
        ));
    }

    /**
     * TPO rejects recruiter opportunity with explanation.
     */
    @PostMapping("/opportunities/{id}/reject")
    public ResponseEntity<?> rejectOpportunity(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {

        RecruiterOpportunity opp = opportunityRepository.findById(id).orElse(null);
        if (opp == null) {
            return ResponseEntity.notFound().build();
        }

        String reason = body != null ? body.get("reason") : "Opportunity does not align with current placement schedule.";
        opp.setStatus("REJECTED_BY_TPO");
        opp.setAdminFeedback(reason);
        opp.setUpdatedAt(LocalDateTime.now());
        opportunityRepository.save(opp);

        // Notify recruiter
        notificationService.notifyRecruiterOpportunityDecision(opp, "REJECTED_BY_TPO", reason);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "opportunity", opp,
                "message", "Opportunity rejected and recruiter notified."
        ));
    }

    /**
     * Manually trigger consolidated TPO daily placement summary.
     */
    @PostMapping("/daily-summary/send")
    public ResponseEntity<?> triggerDailySummary() {
        boolean dispatched = notificationService.sendTpoDailySummary();
        return ResponseEntity.ok(Map.of(
                "success", dispatched,
                "message", dispatched ? "TPO daily summary generated and dispatched successfully." : "Failed to dispatch daily summary."
        ));
    }

    /**
     * Manually trigger deadline reminders for an active drive.
     */
    @PostMapping("/drives/{id}/send-deadline-reminders")
    public ResponseEntity<?> triggerDeadlineReminders(
            @PathVariable String id,
            @RequestParam(value = "hours", defaultValue = "24") int hours) {

        PlacementDrive drive = driveRepository.findById(id).orElse(null);
        if (drive == null) {
            return ResponseEntity.notFound().build();
        }

        int remindersSent = notificationService.sendDriveDeadlineReminders(drive, hours);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "driveId", id,
                "remindersSent", remindersSent,
                "message", remindersSent + " deadline reminders dispatched to eligible pending applicants."
        ));
    }
}
