package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Company;
import com.placement.system.model.CompanyFeedbackReport;
import com.placement.system.model.Notification;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.PlacementOfficer;
import com.placement.system.model.Student;
import com.placement.system.repository.*;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/company")
public class CompanyController {

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private PlacementApplicationRepository applicationRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PlacementOfficerRepository officerRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private com.placement.system.repository.UserRepository userRepository;

    @Autowired
    private AnalysisReportRepository reportRepository;

    @Autowired
    private TestAttemptRepository attemptRepository;

    @Autowired
    private CompanyFeedbackReportRepository feedbackReportRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.placement.system.service.NotificationService notificationService;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/drives")
    public ResponseEntity<?> getCompanyDrives(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Company company = companyRepository.findByUserId(userId).orElse(null);

        List<PlacementDrive> drives = company != null
                ? driveRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId())
                : driveRepository.findAllByOrderByCreatedAtDesc();

        if (drives.isEmpty()) {
            drives = driveRepository.findAllByOrderByCreatedAtDesc();
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (PlacementDrive d : drives) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("title", d.getTitle());
            map.put("jobRole", d.getJobRole());
            map.put("ctc", d.getCtc());
            map.put("workMode", d.getWorkMode());
            map.put("location", d.getLocation());
            map.put("deadline", d.getDeadline());
            map.put("status", d.getStatus());
            map.put("jobDescription", d.getJobDescription());
            map.put("eligibilityCriteria", d.getEligibilityCriteria());
            map.put("_count", Map.of("applications", applicationRepository.countByDriveId(d.getId())));
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/drives")
    public ResponseEntity<?> submitDriveRequisition(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Company company = companyRepository.findByUserId(userId).orElse(null);
        String companyId = company != null ? company.getId() : "default-company";

        PlacementOfficer officer = officerRepository.findAll().stream().findFirst().orElse(null);
        String officerId = officer != null ? officer.getId() : "default-officer";

        try {
            PlacementDrive d = new PlacementDrive();
            d.setCompanyId(companyId);
            d.setOfficerId(officerId);
            d.setTitle((String) body.get("title"));
            d.setJobRole((String) body.get("jobRole"));
            d.setCtc((String) body.getOrDefault("ctc", "Competitive"));
            d.setWorkMode((String) body.getOrDefault("workMode", "ONSITE"));
            d.setJobDescription((String) body.getOrDefault("jobDescription", ""));
            d.setLocation((String) body.getOrDefault("location", "Campus / Hybrid"));
            d.setDeadline(parseDeadline(body.get("deadline")));

            String reqStatus = (String) body.getOrDefault("status", "PENDING_TPO_APPROVAL");
            d.setStatus(reqStatus);

            Object critObj = body.get("eligibilityCriteria");
            d.setEligibilityCriteria(critObj instanceof String ? (String) critObj : mapper.writeValueAsString(critObj));
            final PlacementDrive savedDrive = driveRepository.save(d);

            // Notify TPO
            officerRepository.findAll().forEach(off -> {
                if (off.getUserId() != null) {
                    notificationRepository.save(new Notification(
                        off.getUserId(),
                        "New Campus Drive Requisition",
                        (company != null ? company.getCompanyName() : "A recruiter") + " submitted requisition: " + savedDrive.getTitle(),
                        "DRIVE"
                    ));
                }
            });

            return ResponseEntity.ok(savedDrive);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/drives/{id}/applications")
    public ResponseEntity<?> getCompanyDriveApplications(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Company company = companyRepository.findByUserId(userId).orElse(null);
        PlacementDrive drive = driveRepository.findById(id).orElse(null);

        if (drive != null && company != null && drive.getCompanyId() != null
                && !drive.getCompanyId().equals(company.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not have access to this drive"));
        }

        List<PlacementApplication> apps = applicationRepository.findByDriveIdOrderByAppliedAtDesc(id);
        List<Map<String, Object>> response = new ArrayList<>();

        for (PlacementApplication a : apps) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("studentId", a.getStudentId());
            map.put("driveId", a.getDriveId());
            map.put("status", a.getStatus());
            map.put("appliedAt", a.getAppliedAt());

            Student s = studentRepository.findById(a.getStudentId()).orElse(null);
            if (s != null && (s.getEmail() == null || s.getEmail().isBlank())) {
                userRepository.findById(s.getUserId()).ifPresent(u -> s.setEmail(u.getEmail()));
            }
            map.put("student", s);

            String rUrl = a.getResumeUrl();
            String rName = a.getResumeFileName();
            if ((rUrl == null || rUrl.isBlank()) && s != null) {
                rUrl = s.getResumeUrl();
                rName = s.getResumeFileName();
            }
            map.put("resumeUrl", rUrl != null ? rUrl : "");
            map.put("resumeFileName", rName != null && !rName.isBlank() ? rName : "Resume.pdf");

            if (s != null) {
                com.placement.system.model.AnalysisReport rep = reportRepository.findFirstByStudentIdOrderByGeneratedAtDesc(s.getId()).orElse(null);
                double readiness = rep != null ? rep.getReadinessScore() : 65.0;
                map.put("readinessScore", Math.round(readiness));

                List<com.placement.system.model.TestAttempt> atts = attemptRepository.findByStudentIdAndStatusOrderByCompletedAtDesc(s.getId(), "COMPLETED");
                double avgAccuracy = atts.isEmpty() ? 72.0 : atts.stream().mapToDouble(com.placement.system.model.TestAttempt::getPercentageScore).average().orElse(72.0);
                map.put("averageAccuracy", Math.round(avgAccuracy * 10.0) / 10.0);
            }
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/drives/{driveId}/applications/{appId}/status")
    public ResponseEntity<?> updateCandidateStatus(
            @PathVariable String driveId,
            @PathVariable String appId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Company company = companyRepository.findByUserId(userId).orElse(null);
        PlacementDrive drive = driveRepository.findById(driveId).orElse(null);

        if (drive == null) return ResponseEntity.notFound().build();
        if (company != null && drive.getCompanyId() != null
                && !drive.getCompanyId().equals(company.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not own this drive"));
        }

        PlacementApplication app = applicationRepository.findById(appId).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();

        String newStatus = body.get("status");
        app.setStatus(newStatus);
        app.setUpdatedAt(LocalDateTime.now());
        final PlacementApplication finalApp = applicationRepository.save(app);

        // Notify student of status update
        try {
            studentRepository.findById(finalApp.getStudentId()).ifPresent(st -> {
                if (st.getUserId() != null) {
                    notificationRepository.save(new Notification(
                        st.getUserId(),
                        "Application Status Update: " + newStatus,
                        "Your application status for " + drive.getTitle() + " has been updated to " + newStatus + ".",
                        "SHORTLIST"
                    ));
                }
                if ("SHORTLISTED".equalsIgnoreCase(newStatus) || "SELECTED".equalsIgnoreCase(newStatus)) {
                    notificationService.notifyCandidateShortlisted(st, drive, finalApp, body.get("nextRoundDetails"));
                } else if ("REJECTED".equalsIgnoreCase(newStatus) || "NOT_SELECTED".equalsIgnoreCase(newStatus)) {
                    notificationService.notifyCandidateNotSelected(st, drive, finalApp);
                }
            });
        } catch (Exception ignored) {}

        return ResponseEntity.ok(finalApp);
    }

    @GetMapping("/drives/{id}/feedback")
    public ResponseEntity<?> getDriveFeedback(@PathVariable String id) {
        CompanyFeedbackReport report = feedbackReportRepository.findFirstByDriveIdOrderByGeneratedAtDesc(id).orElse(null);
        if (report == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Feedback report not yet finalized by placement cell"));
        }

        Map<String, Object> parsed = new HashMap<>();
        try {
            parsed = mapper.readValue(report.getReportData(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {}

        Map<String, Object> res = new HashMap<>();
        res.put("id", report.getId());
        res.put("driveId", report.getDriveId());
        res.put("reportData", parsed);
        res.put("generatedAt", report.getGeneratedAt());
        return ResponseEntity.ok(res);
    }

    private LocalDateTime parseDeadline(Object val) {
        if (val == null) return null;
        if (val instanceof LocalDateTime) return (LocalDateTime) val;
        String s = val.toString().trim();
        if (s.isBlank()) return null;
        try {
            if (s.length() == 10) { // e.g. "2026-11-30"
                return java.time.LocalDate.parse(s).atTime(23, 59, 59);
            }
            if (s.contains("Z")) {
                return java.time.Instant.parse(s).atZone(java.time.ZoneId.of("Asia/Kolkata")).toLocalDateTime();
            }
            if (s.length() == 16) { // e.g. "2026-11-30T23:59"
                return LocalDateTime.parse(s + ":00");
            }
            return LocalDateTime.parse(s);
        } catch (Exception e) {
            try {
                return java.time.OffsetDateTime.parse(s).toLocalDateTime();
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
