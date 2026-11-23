package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Notification;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.Student;
import com.placement.system.repository.NotificationRepository;
import com.placement.system.repository.PlacementApplicationRepository;
import com.placement.system.repository.PlacementDriveRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.repository.PlacementOfficerRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    private PlacementOfficerRepository officerRepository;

    @Autowired
    private NotificationRepository notificationRepository;

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
                    // Support both "departments" and "allowedDepartments" via RguktUtils
                    List<String> allowedDepts = extractDepartments(crit);
                    if (!com.placement.system.util.RguktUtils.isDepartmentEligible(allowedDepts, student.getDepartment())) {
                        isEligible = false;
                    }

                    // Check Year and Graduation Batch eligibility
                    List<Integer> allowedYears = extractIntList(crit, "allowedYears");
                    List<Integer> allowedGradYears = extractIntList(crit, "allowedGradYears");
                    if (crit.containsKey("graduationYear") && crit.get("graduationYear") != null) {
                        int reqYear = ((Number) crit.get("graduationYear")).intValue();
                        if (allowedGradYears == null) allowedGradYears = new ArrayList<>();
                        if (!allowedGradYears.contains(reqYear)) allowedGradYears.add(reqYear);
                    }
                    if (!com.placement.system.util.RguktUtils.isYearEligible(allowedYears, allowedGradYears, student.getYear(), student.getGraduationYear())) {
                        isEligible = false;
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

        // Duplicate check
        if (applicationRepository.findByStudentIdAndDriveId(student.getId(), id).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Already applied for this campus drive"));
        }

        // Server-side eligibility enforcement
        PlacementDrive drive = driveRepository.findById(id).orElse(null);
        if (drive == null) return ResponseEntity.notFound().build();

        if (!"PUBLISHED".equals(drive.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("error", "This drive is not accepting applications"));
        }

        // Check deadline
        if (drive.getDeadline() != null && LocalDateTime.now().isAfter(drive.getDeadline())) {
            return ResponseEntity.status(403).body(Map.of("error", "Application deadline has passed"));
        }

        // Parse and enforce eligibility criteria
        try {
            String critJson = drive.getEligibilityCriteria();
            if (critJson != null && !critJson.isBlank() && !critJson.equals("{}")) {
                Map<String, Object> crit = mapper.readValue(critJson, new TypeReference<Map<String, Object>>() {});

                if (crit.containsKey("minCgpa")) {
                    double minCgpa = ((Number) crit.get("minCgpa")).doubleValue();
                    if (student.getCgpa() < minCgpa) {
                        return ResponseEntity.status(403).body(Map.of("error",
                            "You do not meet the minimum CGPA requirement (" + minCgpa + "). Your CGPA: " + student.getCgpa()));
                    }
                }

                if (crit.containsKey("maxBacklogs")) {
                    int maxBacklogs = ((Number) crit.get("maxBacklogs")).intValue();
                    if (student.getBacklogs() > maxBacklogs) {
                        return ResponseEntity.status(403).body(Map.of("error",
                            "You exceed the maximum allowed backlogs (" + maxBacklogs + "). Your backlogs: " + student.getBacklogs()));
                    }
                }

                List<String> allowedDepts = extractDepartments(crit);
                if (!com.placement.system.util.RguktUtils.isDepartmentEligible(allowedDepts, student.getDepartment())) {
                    return ResponseEntity.status(403).body(Map.of("error",
                        "Your department (" + student.getDepartment() + ") is not eligible for this drive"));
                }

                List<Integer> allowedYears = extractIntList(crit, "allowedYears");
                List<Integer> allowedGradYears = extractIntList(crit, "allowedGradYears");
                if (crit.containsKey("graduationYear") && crit.get("graduationYear") != null) {
                    int reqYear = ((Number) crit.get("graduationYear")).intValue();
                    if (allowedGradYears == null) allowedGradYears = new ArrayList<>();
                    if (!allowedGradYears.contains(reqYear)) allowedGradYears.add(reqYear);
                }
                if (!com.placement.system.util.RguktUtils.isYearEligible(allowedYears, allowedGradYears, student.getYear(), student.getGraduationYear())) {
                    return ResponseEntity.status(403).body(Map.of("error",
                        "This drive is restricted to eligible batches/years. Your batch: " + student.getBatch()));
                }
            }
        } catch (Exception e) {
            // Fail-open for malformed criteria
        }

        PlacementApplication app = new PlacementApplication(student.getId(), id);
        app = applicationRepository.save(app);

        // Notify TPO and student
        try {
            notificationRepository.save(new Notification(
                userId,
                "Application Submitted",
                "You successfully applied for " + drive.getTitle() + " (" + drive.getJobRole() + ").",
                "APPLICATION"
            ));

            officerRepository.findAll().forEach(off -> {
                if (off.getUserId() != null) {
                    notificationRepository.save(new Notification(
                        off.getUserId(),
                        "New Applicant Registered",
                        student.getName() + " (" + student.getDepartment() + ") applied for " + drive.getTitle() + ".",
                        "APPLICATION"
                    ));
                }
            });
        } catch (Exception ignored) {}

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

    @SuppressWarnings("unchecked")
    private List<String> extractDepartments(Map<String, Object> crit) {
        if (crit.containsKey("departments") && crit.get("departments") instanceof List) {
            return (List<String>) crit.get("departments");
        }
        if (crit.containsKey("allowedDepartments") && crit.get("allowedDepartments") instanceof List) {
            return (List<String>) crit.get("allowedDepartments");
        }
        return null;
    }

    private List<Integer> extractIntList(Map<String, Object> crit, String key) {
        if (crit.containsKey(key) && crit.get(key) instanceof List<?> list) {
            List<Integer> result = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Number n) {
                    result.add(n.intValue());
                } else if (item instanceof String s) {
                    try {
                        result.add(Integer.parseInt(s.trim()));
                    } catch (NumberFormatException ignored) {}
                }
            }
            return result;
        }
        return null;
    }
}
