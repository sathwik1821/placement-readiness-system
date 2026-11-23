package com.placement.system.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.dto.ApplyDriveRequestDto;
import com.placement.system.model.Notification;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.Student;
import com.placement.system.repository.*;
import com.placement.system.util.RguktUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class PlacementService {

    private static final Logger logger = LoggerFactory.getLogger(PlacementService.class);

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
    private NotificationService notificationService;

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Retrieves published campus drives evaluated against student's academic eligibility.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentDrives(String userId) {
        Student student = studentRepository.findByUserId(userId).orElse(null);
        List<PlacementDrive> drives = driveRepository.findAllByOrderByCreatedAtDesc();
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

            boolean isEligible = true;
            Map<String, Object> crit = Collections.emptyMap();
            try {
                if (d.getEligibilityCriteria() != null && !d.getEligibilityCriteria().isBlank() && !d.getEligibilityCriteria().equals("{}")) {
                    crit = mapper.readValue(d.getEligibilityCriteria(), new TypeReference<Map<String, Object>>() {});
                    if (student != null) {
                        if (crit.containsKey("minCgpa")) {
                            double min = ((Number) crit.get("minCgpa")).doubleValue();
                            if (student.getCgpa() != null && student.getCgpa() < min) isEligible = false;
                        }
                        if (crit.containsKey("maxBacklogs")) {
                            int max = ((Number) crit.get("maxBacklogs")).intValue();
                            if (student.getBacklogs() != null && student.getBacklogs() > max) isEligible = false;
                        }
                        List<String> allowedDepts = extractDepartments(crit);
                        if (!allowedDepts.isEmpty() && !RguktUtils.isDepartmentEligible(allowedDepts, student.getDepartment())) {
                            isEligible = false;
                        }
                        List<Integer> allowedYears = extractIntList(crit, "allowedYears");
                        List<Integer> allowedGradYears = extractIntList(crit, "allowedGradYears");
                        if (!RguktUtils.isYearEligible(allowedYears, allowedGradYears, student.getYear(), student.getGraduationYear())) {
                            isEligible = false;
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("Criteria evaluation exception for drive {}: {}", d.getId(), e.getMessage());
            }

            map.put("eligibilityCriteria", crit);
            map.put("isEligible", isEligible);
            response.add(map);
        }

        return response;
    }

    /**
     * Stores uploaded resume document safely and associates with student profile.
     */
    public Map<String, Object> uploadResume(MultipartFile file, String userId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file uploaded. Please select a valid document.");
        }
        if (file.getSize() > 15 * 1024 * 1024) {
            throw new IllegalArgumentException("File exceeds the 15MB size limit.");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) originalFilename = "resume.pdf";
        String ext = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx >= 0) ext = originalFilename.substring(dotIdx).toLowerCase();

        if (!ext.equals(".pdf") && !ext.equals(".docx") && !ext.equals(".doc")) {
            throw new IllegalArgumentException("Only PDF and Word (.docx, .doc) files are allowed.");
        }

        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "resumes";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String safeBase = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
            String storedFileName = UUID.randomUUID().toString() + "_" + safeBase;
            File dest = new File(dir, storedFileName);
            file.transferTo(dest);

            String resumeUrl = "/api/placement/resumes/" + storedFileName;

            if (userId != null) {
                studentRepository.findByUserId(userId).ifPresent(s -> {
                    s.setResumeUrl(resumeUrl);
                    s.setResumeFileName(safeBase);
                    studentRepository.save(s);
                });
            }

            return Map.of("resumeUrl", resumeUrl, "resumeFileName", safeBase, "fileSize", file.getSize());
        } catch (Exception e) {
            throw new RuntimeException("Failed to store resume document: " + e.getMessage(), e);
        }
    }

    /**
     * Submits student application with server-side eligibility verification and event notifications.
     */
    public PlacementApplication applyForDrive(String driveId, String userId, ApplyDriveRequestDto dto) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found"));

        // Duplicate application guard
        if (applicationRepository.findByStudentIdAndDriveId(student.getId(), driveId).isPresent()) {
            throw new IllegalStateException("Already applied for this campus drive");
        }

        PlacementDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new IllegalArgumentException("Placement drive not found"));

        if (!"PUBLISHED".equalsIgnoreCase(drive.getStatus())) {
            throw new IllegalStateException("This drive is not accepting applications");
        }

        if (drive.getDeadline() != null && LocalDateTime.now().isAfter(drive.getDeadline())) {
            throw new IllegalStateException("Application deadline has passed");
        }

        // Eligibility enforcement
        validateEligibility(drive, student);

        PlacementApplication app = new PlacementApplication(student.getId(), driveId);

        // Resume resolution
        String resumeUrl = dto != null ? dto.getResumeUrl() : null;
        String resumeFileName = dto != null ? dto.getResumeFileName() : null;

        if ((resumeUrl == null || resumeUrl.isBlank()) && student.getResumeUrl() != null && !student.getResumeUrl().isBlank()) {
            resumeUrl = student.getResumeUrl();
            resumeFileName = student.getResumeFileName();
        }

        if (resumeUrl != null && !resumeUrl.isBlank()) {
            app.setResumeUrl(resumeUrl);
            app.setResumeFileName(resumeFileName != null && !resumeFileName.isBlank() ? resumeFileName : "Resume.pdf");

            if (student.getResumeUrl() == null || student.getResumeUrl().isBlank()) {
                student.setResumeUrl(resumeUrl);
                student.setResumeFileName(app.getResumeFileName());
                studentRepository.save(student);
            }
        }

        app = applicationRepository.save(app);

        // In-App and Email Notifications
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

            // Trigger Centralized Email Notification
            notificationService.notifyApplicationSubmitted(student, drive, app);

        } catch (Exception e) {
            logger.warn("Notification dispatch exception on apply: {}", e.getMessage());
        }

        return app;
    }

    /**
     * Retrieves application history for authenticated student.
     */
    @Transactional(readOnly = true)
    public List<PlacementApplication> getStudentApplications(String userId) {
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return List.of();

        List<PlacementApplication> apps = applicationRepository.findByStudentIdOrderByAppliedAtDesc(student.getId());
        for (PlacementApplication a : apps) {
            driveRepository.findById(a.getDriveId()).ifPresent(d -> {
                a.setDrive(d);
            });
        }
        return apps;
    }

    private void validateEligibility(PlacementDrive drive, Student student) {
        String critJson = drive.getEligibilityCriteria();
        if (critJson == null || critJson.isBlank() || critJson.equals("{}")) return;

        try {
            Map<String, Object> crit = mapper.readValue(critJson, new TypeReference<Map<String, Object>>() {});
            if (crit.containsKey("minCgpa")) {
                double minCgpa = ((Number) crit.get("minCgpa")).doubleValue();
                if (student.getCgpa() != null && student.getCgpa() < minCgpa) {
                    throw new IllegalStateException("Minimum CGPA requirement (" + minCgpa + ") not met. Your CGPA: " + student.getCgpa());
                }
            }
            if (crit.containsKey("maxBacklogs")) {
                int maxBacklogs = ((Number) crit.get("maxBacklogs")).intValue();
                if (student.getBacklogs() != null && student.getBacklogs() > maxBacklogs) {
                    throw new IllegalStateException("Exceeds maximum backlogs (" + maxBacklogs + "). Your backlogs: " + student.getBacklogs());
                }
            }
            List<String> allowedDepts = extractDepartments(crit);
            if (!allowedDepts.isEmpty() && !RguktUtils.isDepartmentEligible(allowedDepts, student.getDepartment())) {
                throw new IllegalStateException("Department (" + student.getDepartment() + ") is not eligible for this drive");
            }
            List<Integer> allowedYears = extractIntList(crit, "allowedYears");
            List<Integer> allowedGradYears = extractIntList(crit, "allowedGradYears");
            if (!RguktUtils.isYearEligible(allowedYears, allowedGradYears, student.getYear(), student.getGraduationYear())) {
                throw new IllegalStateException("Restricted batch/year. Your batch: " + student.getBatch());
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception ignored) {}
    }

    private List<String> extractDepartments(Map<String, Object> crit) {
        List<String> depts = new ArrayList<>();
        if (crit.containsKey("allowedDepartments") && crit.get("allowedDepartments") instanceof List) {
            for (Object obj : (List<?>) crit.get("allowedDepartments")) {
                if (obj != null) depts.add(obj.toString());
            }
        } else if (crit.containsKey("departments") && crit.get("departments") instanceof List) {
            for (Object obj : (List<?>) crit.get("departments")) {
                if (obj != null) depts.add(obj.toString());
            }
        }
        return depts;
    }

    private List<Integer> extractIntList(Map<String, Object> crit, String key) {
        List<Integer> result = new ArrayList<>();
        if (crit.containsKey(key) && crit.get(key) instanceof List) {
            for (Object item : (List<?>) crit.get(key)) {
                if (item instanceof Number) result.add(((Number) item).intValue());
                else if (item != null) {
                    try { result.add(Integer.parseInt(item.toString().trim())); } catch (Exception ignored) {}
                }
            }
        }
        return result;
    }
}
