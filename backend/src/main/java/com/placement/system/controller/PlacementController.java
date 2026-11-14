package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.Student;
import com.placement.system.repository.PlacementApplicationRepository;
import com.placement.system.repository.PlacementDriveRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/placement")
public class PlacementController {

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private PlacementApplicationRepository applicationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/drives")
    public ResponseEntity<?> getEligibleDrives(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);

        List<PlacementDrive> drives = driveRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED");
        List<Map<String, Object>> response = new ArrayList<>();

        for (PlacementDrive d : drives) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("title", d.getTitle());
            map.put("jobRole", d.getJobRole());
            map.put("ctc", d.getCtc());
            map.put("workMode", d.getWorkMode());
            map.put("jobDescription", d.getJobDescription());
            map.put("location", d.getLocation());
            map.put("deadline", d.getDeadline());
            map.put("status", d.getStatus());

            Map<String, Object> crit = new HashMap<>();
            boolean isEligible = true;
            try {
                crit = mapper.readValue(d.getEligibilityCriteria(), new TypeReference<Map<String, Object>>() {});
                if (student != null) {
                    if (crit.containsKey("minCgpa")) {
                        double minC = ((Number) crit.get("minCgpa")).doubleValue();
                        if (student.getCgpa() < minC) isEligible = false;
                    }
                    if (crit.containsKey("maxBacklogs")) {
                        int maxB = ((Number) crit.get("maxBacklogs")).intValue();
                        if (student.getBacklogs() > maxB) isEligible = false;
                    }
                }
            } catch (Exception e) {
                // Ignore parse error
            }

            map.put("eligibilityCriteria", crit);
            map.put("isEligible", isEligible);
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/drives/{id}/apply")
    public ResponseEntity<?> applyForDrive(@RequestHeader("Authorization") String authHeader, @PathVariable String id) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.badRequest().body(Map.of("error", "Student profile not found"));

        if (applicationRepository.findByStudentIdAndDriveId(student.getId(), id).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Already applied for this campus drive"));
        }

        PlacementApplication app = new PlacementApplication(student.getId(), id);
        app = applicationRepository.save(app);
        return ResponseEntity.ok(app);
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.ok(List.of());

        List<PlacementApplication> apps = applicationRepository.findByStudentIdOrderByAppliedAtDesc(student.getId());
        for (PlacementApplication a : apps) {
            driveRepository.findById(a.getDriveId()).ifPresent(d -> a.setDrive(d));
        }
        return ResponseEntity.ok(apps);
    }
}
