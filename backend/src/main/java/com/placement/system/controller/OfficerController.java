package com.placement.system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.CompanyFeedbackReport;
import com.placement.system.model.Notification;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.PlacementOfficer;
import com.placement.system.repository.CompanyFeedbackReportRepository;
import com.placement.system.repository.NotificationRepository;
import com.placement.system.repository.PlacementApplicationRepository;
import com.placement.system.repository.PlacementDriveRepository;
import com.placement.system.repository.PlacementOfficerRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.repository.UserRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/officer")
public class OfficerController {

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private PlacementApplicationRepository applicationRepository;

    @Autowired
    private PlacementOfficerRepository officerRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyFeedbackReportRepository feedbackReportRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/drives")
    public ResponseEntity<?> getOfficerDrives(@RequestHeader("Authorization") String authHeader) {
        List<PlacementDrive> drives = driveRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> response = new ArrayList<>();

        for (PlacementDrive d : drives) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("companyId", d.getCompanyId());
            map.put("title", d.getTitle());
            map.put("jobRole", d.getJobRole());
            map.put("ctc", d.getCtc());
            map.put("workMode", d.getWorkMode());
            map.put("location", d.getLocation());
            map.put("deadline", d.getDeadline());
            map.put("status", d.getStatus());
            map.put("_count", Map.of("applications", applicationRepository.countByDriveId(d.getId())));
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/drives")
    public ResponseEntity<?> createDrive(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Object> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        PlacementOfficer officer = officerRepository.findByUserId(userId).orElse(null);
        String officerId = officer != null ? officer.getId() : "default-officer";

        try {
            PlacementDrive d = new PlacementDrive();
            d.setOfficerId(officerId);
            d.setTitle((String) body.get("title"));
            d.setJobRole((String) body.get("jobRole"));
            d.setCtc((String) body.getOrDefault("ctc", "Competitive"));
            d.setWorkMode((String) body.getOrDefault("workMode", "ONSITE"));
            d.setJobDescription((String) body.getOrDefault("jobDescription", ""));
            d.setLocation((String) body.getOrDefault("location", "Campus"));
            d.setDeadline(parseDeadline(body.get("deadline")));
            d.setStatus("PUBLISHED");

            Object critObj = body.get("eligibilityCriteria");
            d.setEligibilityCriteria(critObj instanceof String ? (String) critObj : mapper.writeValueAsString(critObj));
            final PlacementDrive savedDrive = driveRepository.save(d);

            // Broadcast notification to all students
            studentRepository.findAll().forEach(st -> {
                if (st.getUserId() != null) {
                    notificationRepository.save(new Notification(
                        st.getUserId(),
                        "New Placement Drive Published",
                        savedDrive.getTitle() + " (" + savedDrive.getJobRole() + ", " + savedDrive.getCtc() + ") is now accepting applications.",
                        "DRIVE"
                    ));
                }
            });

            return ResponseEntity.ok(savedDrive);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/drives/{id}/status")
    public ResponseEntity<?> updateDriveStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        PlacementDrive drive = driveRepository.findById(id).orElse(null);
        if (drive == null) return ResponseEntity.notFound().build();

        if (body.containsKey("deadline")) {
            drive.setDeadline(parseDeadline(body.get("deadline")));
            drive = driveRepository.save(drive);
        }

        String newStatus = body.get("status") != null ? body.get("status").toString() : null;
        if (newStatus != null && !newStatus.isBlank()) {
            drive.setStatus(newStatus.toUpperCase());
            drive = driveRepository.save(drive);

            // If drive is now PUBLISHED, notify students
            if ("PUBLISHED".equalsIgnoreCase(newStatus)) {
                PlacementDrive finalDrive = drive;
                studentRepository.findAll().forEach(st -> {
                    if (st.getUserId() != null) {
                        notificationRepository.save(new Notification(
                            st.getUserId(),
                            "Drive Approved & Live",
                            finalDrive.getTitle() + " has been approved by the placement cell and is now open for applications.",
                            "DRIVE"
                        ));
                    }
                });
            }
        }
        return ResponseEntity.ok(drive);
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

    @GetMapping("/drives/{id}/applications")
    public ResponseEntity<?> getDriveApplications(@PathVariable String id) {
        List<PlacementApplication> apps = applicationRepository.findByDriveIdOrderByAppliedAtDesc(id);
        for (PlacementApplication a : apps) {
            studentRepository.findById(a.getStudentId()).ifPresent(s -> {
                if (s.getEmail() == null || s.getEmail().isBlank()) {
                    userRepository.findById(s.getUserId()).ifPresent(u -> s.setEmail(u.getEmail()));
                }
                a.setStudent(s);
            });
        }
        return ResponseEntity.ok(apps);
    }

    @PutMapping("/drives/{driveId}/applications/{appId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable String driveId, @PathVariable String appId, @RequestBody Map<String, String> body) {
        PlacementApplication app = applicationRepository.findById(appId).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();

        // Guard: TPO cannot change status on recruiter-managed drives
        PlacementDrive drive = driveRepository.findById(driveId).orElse(null);
        if (drive != null && drive.getCompanyId() != null && !drive.getCompanyId().isBlank()) {
            return ResponseEntity.status(403).body(Map.of("error",
                "This drive is managed by a recruiter — candidate status changes are restricted to the recruiting company"));
        }

        String newStatus = body.get("status");
        app.setStatus(newStatus);
        app.setUpdatedAt(LocalDateTime.now());
        app = applicationRepository.save(app);

        // Notify student
        try {
            studentRepository.findById(app.getStudentId()).ifPresent(st -> {
                if (st.getUserId() != null) {
                    notificationRepository.save(new Notification(
                        st.getUserId(),
                        "Application Status: " + newStatus,
                        "Your application status for " + (drive != null ? drive.getTitle() : "campus drive") + " is now " + newStatus + ".",
                        "SHORTLIST"
                    ));
                }
            });
        } catch (Exception ignored) {}

        return ResponseEntity.ok(app);
    }

    @PostMapping("/drives/{id}/feedback-report")
    public ResponseEntity<?> generateFeedbackReport(@RequestHeader("Authorization") String authHeader, @PathVariable String id) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        PlacementOfficer officer = officerRepository.findByUserId(userId).orElse(null);

        List<PlacementApplication> apps = applicationRepository.findByDriveIdOrderByAppliedAtDesc(id);
        long shortlisted = apps.stream().filter(a -> "SHORTLISTED".equals(a.getStatus()) || "SELECTED".equals(a.getStatus())).count();
        long selected = apps.stream().filter(a -> "SELECTED".equals(a.getStatus())).count();

        Map<String, Object> data = new HashMap<>();
        data.put("totalApplicants", apps.size());
        data.put("shortlistedCount", shortlisted);
        data.put("selectedCount", selected);
        data.put("averageCgpa", "8.20");

        try {
            CompanyFeedbackReport report = new CompanyFeedbackReport();
            report.setDriveId(id);
            report.setOfficerId(officer != null ? officer.getId() : "default");
            report.setReportData(mapper.writeValueAsString(data));
            report = feedbackReportRepository.save(report);

            return ResponseEntity.ok(Map.of("report", report, "data", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
