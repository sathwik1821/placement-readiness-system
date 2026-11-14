package com.placement.system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.CompanyFeedbackReport;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.PlacementOfficer;
import com.placement.system.repository.CompanyFeedbackReportRepository;
import com.placement.system.repository.PlacementApplicationRepository;
import com.placement.system.repository.PlacementDriveRepository;
import com.placement.system.repository.PlacementOfficerRepository;
import com.placement.system.repository.StudentRepository;
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
    private CompanyFeedbackReportRepository feedbackReportRepository;

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
            d.setStatus("PUBLISHED");

            Object critObj = body.get("eligibilityCriteria");
            d.setEligibilityCriteria(critObj instanceof String ? (String) critObj : mapper.writeValueAsString(critObj));
            d = driveRepository.save(d);
            return ResponseEntity.ok(d);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/drives/{id}/status")
    public ResponseEntity<?> updateDriveStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        PlacementDrive drive = driveRepository.findById(id).orElse(null);
        if (drive == null) return ResponseEntity.notFound().build();

        String newStatus = body.get("status");
        if (newStatus != null && !newStatus.isBlank()) {
            drive.setStatus(newStatus.toUpperCase());
            drive = driveRepository.save(drive);
        }
        return ResponseEntity.ok(drive);
    }

    @GetMapping("/drives/{id}/applications")
    public ResponseEntity<?> getDriveApplications(@PathVariable String id) {
        List<PlacementApplication> apps = applicationRepository.findByDriveIdOrderByAppliedAtDesc(id);
        for (PlacementApplication a : apps) {
            studentRepository.findById(a.getStudentId()).ifPresent(s -> a.setStudent(s));
        }
        return ResponseEntity.ok(apps);
    }

    @PutMapping("/drives/{driveId}/applications/{appId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable String driveId, @PathVariable String appId, @RequestBody Map<String, String> body) {
        PlacementApplication app = applicationRepository.findById(appId).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();

        app.setStatus(body.get("status"));
        app.setUpdatedAt(LocalDateTime.now());
        app = applicationRepository.save(app);
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
