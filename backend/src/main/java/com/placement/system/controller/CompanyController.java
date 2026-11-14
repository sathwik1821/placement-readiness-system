package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Company;
import com.placement.system.model.CompanyFeedbackReport;
import com.placement.system.model.PlacementDrive;
import com.placement.system.repository.CompanyFeedbackReportRepository;
import com.placement.system.repository.CompanyRepository;
import com.placement.system.repository.PlacementApplicationRepository;
import com.placement.system.repository.PlacementDriveRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            map.put("_count", Map.of("applications", applicationRepository.countByDriveId(d.getId())));
            response.add(map);
        }
        return ResponseEntity.ok(response);
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
