package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Company;
import com.placement.system.model.CompanyFeedbackReport;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.PlacementOfficer;
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
    private CompanyFeedbackReportRepository feedbackReportRepository;

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

            String reqStatus = (String) body.getOrDefault("status", "PENDING_TPO_APPROVAL");
            d.setStatus(reqStatus);

            Object critObj = body.get("eligibilityCriteria");
            d.setEligibilityCriteria(critObj instanceof String ? (String) critObj : mapper.writeValueAsString(critObj));
            d = driveRepository.save(d);
            return ResponseEntity.ok(d);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/drives/{id}/applications")
    public ResponseEntity<?> getCompanyDriveApplications(@PathVariable String id) {
        List<PlacementApplication> apps = applicationRepository.findByDriveIdOrderByAppliedAtDesc(id);
        for (PlacementApplication a : apps) {
            studentRepository.findById(a.getStudentId()).ifPresent(a::setStudent);
        }
        return ResponseEntity.ok(apps);
    }

    @PutMapping("/drives/{driveId}/applications/{appId}/status")
    public ResponseEntity<?> updateCandidateStatus(
            @PathVariable String driveId,
            @PathVariable String appId,
            @RequestBody Map<String, String> body) {
        PlacementApplication app = applicationRepository.findById(appId).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();

        app.setStatus(body.get("status"));
        app.setUpdatedAt(LocalDateTime.now());
        app = applicationRepository.save(app);
        return ResponseEntity.ok(app);
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
}
