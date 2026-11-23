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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
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
    private com.placement.system.service.NotificationService notificationService;

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

    @PostMapping("/upload-resume")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file uploaded. Please select a valid document."));
        }
        if (file.getSize() > 15 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File exceeds the 15MB size limit."));
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) originalFilename = "resume.pdf";
        String ext = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx >= 0) {
            ext = originalFilename.substring(dotIdx).toLowerCase();
        }
        if (!ext.equals(".pdf") && !ext.equals(".docx") && !ext.equals(".doc")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only PDF and Word (.docx, .doc) files are allowed."));
        }

        final String finalOriginalName = originalFilename;

        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "resumes";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String safeBase = finalOriginalName.replaceAll("[^a-zA-Z0-9.-]", "_");
            String storedFileName = UUID.randomUUID().toString() + "_" + safeBase;
            File dest = new File(dir, storedFileName);
            file.transferTo(dest);

            String resumeUrl = "/api/placement/resumes/" + storedFileName;

            // Automatically persist to student profile if user is authenticated
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
                    studentRepository.findByUserId(userId).ifPresent(s -> {
                        s.setResumeUrl(resumeUrl);
                        s.setResumeFileName(finalOriginalName);
                        studentRepository.save(s);
                    });
                } catch (Exception ignored) {}
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("resumeUrl", resumeUrl);
            resp.put("resumeFileName", finalOriginalName);
            resp.put("fileSize", file.getSize());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to store resume document: " + e.getMessage()));
        }
    }

    @GetMapping("/resumes/{fileName:.+}")
    public ResponseEntity<Resource> viewResume(@PathVariable String fileName) {
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }
        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "resumes";
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lower.endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else if (lower.endsWith(".doc")) {
                contentType = "application/msword";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/drives/{id}/apply")
    public ResponseEntity<?> applyForDrive(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
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

        // Resolve Resume (from request payload or student profile)
        String resumeUrl = body != null ? body.get("resumeUrl") : null;
        String resumeFileName = body != null ? body.get("resumeFileName") : null;
        if ((resumeUrl == null || resumeUrl.isBlank()) && student.getResumeUrl() != null && !student.getResumeUrl().isBlank()) {
            resumeUrl = student.getResumeUrl();
            resumeFileName = student.getResumeFileName();
        }

        if (resumeUrl != null && !resumeUrl.isBlank()) {
            app.setResumeUrl(resumeUrl);
            app.setResumeFileName(resumeFileName != null && !resumeFileName.isBlank() ? resumeFileName : "Resume.pdf");

            // Also set default profile resume if student doesn't have one
            if (student.getResumeUrl() == null || student.getResumeUrl().isBlank()) {
                student.setResumeUrl(resumeUrl);
                student.setResumeFileName(app.getResumeFileName());
                studentRepository.save(student);
            }
        }

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

            // Centralized institutional email notification
            notificationService.notifyApplicationSubmitted(student, drive, app);
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
