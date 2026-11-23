package com.placement.system.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.*;
import com.placement.system.repository.*;
import com.placement.system.util.RguktUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailTemplateService emailTemplateService;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlacementOfficerRepository officerRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private PlacementApplicationRepository applicationRepository;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.admin-email:admin@system.com}")
    private String adminEmail;

    private final ObjectMapper mapper = new ObjectMapper();

    // =========================================================================
    // 1. RECRUITER NOTIFICATION WORKFLOWS
    // =========================================================================

    /**
     * Triggered when an external recruiter submits an opportunity requisition.
     * 1. Sends submission confirmation email with unique tracking Reference ID to recruiter.
     * 2. Triggers notification alert to Admin for review.
     */
    public void notifyRecruiterOpportunitySubmitted(RecruiterOpportunity opp) {
        if (opp == null) return;

        try {
            // 1. Recruiter confirmation email
            String dedupKeyRecruiter = "OPP_SUBMIT_CONFIRM_" + opp.getId();
            String htmlRecruiter = emailTemplateService.buildRecruiterSubmissionConfirmation(opp);
            String subjectRecruiter = "[Ascend RGUKT] Placement Requisition Received: " + opp.getReferenceId();

            emailService.sendHtmlEmailAsync(
                    opp.getRecruiterEmail(),
                    opp.getRecruiterName(),
                    "RECRUITER",
                    subjectRecruiter,
                    htmlRecruiter,
                    "RECRUITER_SUBMISSION_CONFIRMATION",
                    opp.getId(),
                    dedupKeyRecruiter
            );

            // 2. Alert Admin of new opportunity in verification queue
            notifyAdminOpportunityReviewRequired(opp);

        } catch (Exception e) {
            logger.error("Error dispatching recruiter submission notification for opp {}: {}", opp.getId(), e.getMessage());
        }
    }

    /**
     * Alert Admin that a new recruiter opportunity requires verification.
     */
    public void notifyAdminOpportunityReviewRequired(RecruiterOpportunity opp) {
        if (opp == null) return;

        try {
            String dedupKeyAdmin = "ADMIN_REVIEW_ALERT_" + opp.getId();
            String adminUrl = baseUrl + "/admin";
            String htmlAdmin = emailTemplateService.buildAdminOpportunityReviewAlert(opp, adminUrl);
            String subjectAdmin = "[Ascend Action Required] Verify Opportunity: " + opp.getCompanyName() + " (" + opp.getReferenceId() + ")";

            emailService.sendHtmlEmailAsync(
                    adminEmail,
                    "Ascend Placement Administrator",
                    "ADMIN",
                    subjectAdmin,
                    htmlAdmin,
                    "ADMIN_OPPORTUNITY_REVIEW_ALERT",
                    opp.getId(),
                    dedupKeyAdmin
            );

            // Also record in-app notification for admin users
            userRepository.findByRole("ADMIN").forEach(adminUser -> {
                notificationRepository.save(new Notification(
                        adminUser.getId(),
                        "New Recruiter Opportunity Submitted",
                        opp.getCompanyName() + " submitted requisition " + opp.getReferenceId() + " (" + opp.getJobRole() + "). Awaiting admin verification.",
                        "DRIVE"
                ));
            });

        } catch (Exception e) {
            logger.error("Error notifying Admin of opportunity {}: {}", opp.getId(), e.getMessage());
        }
    }

    /**
     * Alert TPO that an opportunity has been verified by Admin and requires drive scheduling.
     */
    public void notifyTpoOpportunityRequiresApproval(RecruiterOpportunity opp) {
        if (opp == null) return;

        try {
            String tpoUrl = baseUrl + "/officer";
            String htmlTpo = emailTemplateService.buildTpoOpportunityApprovalRequest(opp, tpoUrl);
            String subjectTpo = "[Ascend TPO Decision] Opportunity Approved by Admin: " + opp.getCompanyName() + " (" + opp.getReferenceId() + ")";

            List<PlacementOfficer> officers = officerRepository.findAll();
            if (officers.isEmpty()) {
                // Fallback to institutional TPO email
                emailService.sendHtmlEmailAsync(
                        "tpo@rguktsklm.ac.in",
                        "Head Training & Placement Officer",
                        "TPO",
                        subjectTpo,
                        htmlTpo,
                        "TPO_OPPORTUNITY_APPROVAL_REQUEST",
                        opp.getId(),
                        "TPO_OPP_REQ_" + opp.getId() + "_DEFAULT"
                );
            } else {
                for (PlacementOfficer officer : officers) {
                    String officerEmail = resolveOfficerEmail(officer);
                    String dedupKey = "TPO_OPP_REQ_" + opp.getId() + "_" + officer.getId();

                    emailService.sendHtmlEmailAsync(
                            officerEmail,
                            officer.getName(),
                            "TPO",
                            subjectTpo,
                            htmlTpo,
                            "TPO_OPPORTUNITY_APPROVAL_REQUEST",
                            opp.getId(),
                            dedupKey
                    );

                    if (officer.getUserId() != null) {
                        notificationRepository.save(new Notification(
                                officer.getUserId(),
                                "Opportunity Pending TPO Approval",
                                "Admin approved " + opp.getCompanyName() + " (" + opp.getJobRole() + "). Please schedule and publish campus drive.",
                                "DRIVE"
                        ));
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error notifying TPO of opportunity {}: {}", opp.getId(), e.getMessage());
        }
    }

    /**
     * Notify recruiter of status decision:
     * - APPROVED_FOR_TPO / PUBLISHED
     * - INFO_REQUESTED (with secure response token)
     * - REJECTED_BY_ADMIN / REJECTED_BY_TPO
     */
    public void notifyRecruiterOpportunityDecision(RecruiterOpportunity opp, String decision, String explanation) {
        if (opp == null) return;

        try {
            String secureResponseUrl = baseUrl + "/public/opportunities/respond?token=" + opp.getSecureToken();
            String html = emailTemplateService.buildRecruiterOpportunityDecision(opp, decision, explanation, secureResponseUrl);
            String subject = "[Ascend RGUKT] Opportunity Status Update: " + opp.getReferenceId();
            String dedupKey = "OPP_DECISION_" + opp.getId() + "_" + decision;

            emailService.sendHtmlEmailAsync(
                    opp.getRecruiterEmail(),
                    opp.getRecruiterName(),
                    "RECRUITER",
                    subject,
                    html,
                    "RECRUITER_DECISION_" + decision,
                    opp.getId(),
                    dedupKey
            );

        } catch (Exception e) {
            logger.error("Error notifying recruiter decision for opp {}: {}", opp.getId(), e.getMessage());
        }
    }

    // =========================================================================
    // 2. STUDENT NOTIFICATION WORKFLOWS
    // =========================================================================

    /**
     * Broadcast published drive notification exclusively to ELIGIBLE students.
     */
    public void notifyDrivePublished(PlacementDrive drive) {
        if (drive == null || !"PUBLISHED".equalsIgnoreCase(drive.getStatus())) return;

        try {
            String driveUrl = baseUrl + "/student";
            List<Student> students = studentRepository.findAll();

            Map<String, Object> criteria = parseCriteria(drive.getEligibilityCriteria());
            Double minCgpa = criteria.containsKey("minCgpa") ? ((Number) criteria.get("minCgpa")).doubleValue() : null;
            Integer maxBacklogs = criteria.containsKey("maxBacklogs") ? ((Number) criteria.get("maxBacklogs")).intValue() : null;
            List<String> allowedDepts = extractDepartments(criteria);
            List<Integer> allowedYears = extractIntList(criteria, "allowedYears");
            List<Integer> allowedGradYears = extractIntList(criteria, "allowedGradYears");

            for (Student student : students) {
                // Check eligibility
                if (minCgpa != null && student.getCgpa() != null && student.getCgpa() < minCgpa) {
                    continue; // Skip ineligible
                }
                if (maxBacklogs != null && student.getBacklogs() != null && student.getBacklogs() > maxBacklogs) {
                    continue;
                }
                if (!allowedDepts.isEmpty() && !RguktUtils.isDepartmentEligible(allowedDepts, student.getDepartment())) {
                    continue;
                }
                if (!RguktUtils.isYearEligible(allowedYears, allowedGradYears, student.getYear(), student.getGraduationYear())) {
                    continue;
                }

                // Student is eligible!
                String studentEmail = resolveStudentEmail(student);
                if (studentEmail == null || studentEmail.isBlank()) continue;

                String dedupKey = "DRIVE_PUB_" + drive.getId() + "_" + student.getId();
                String html = emailTemplateService.buildStudentDrivePublished(student, drive, driveUrl);
                String subject = "[Ascend Campus Drive] " + drive.getTitle() + " – " + drive.getJobRole();

                emailService.sendHtmlEmailAsync(
                        studentEmail,
                        student.getName(),
                        "STUDENT",
                        subject,
                        html,
                        "STUDENT_DRIVE_PUBLISHED",
                        drive.getId(),
                        dedupKey
                );

                // Save in-app notification
                if (student.getUserId() != null) {
                    notificationRepository.save(new Notification(
                            student.getUserId(),
                            "New Campus Drive: " + drive.getTitle(),
                            drive.getTitle() + " (" + drive.getJobRole() + ", " + drive.getCtc() + ") is now accepting applications.",
                            "DRIVE"
                    ));
                }
            }

        } catch (Exception e) {
            logger.error("Error broadcasting drive published notification for drive {}: {}", drive.getId(), e.getMessage());
        }
    }

    /**
     * Dispatch application confirmation email to student upon submission.
     */
    public void notifyApplicationSubmitted(Student student, PlacementDrive drive, PlacementApplication app) {
        if (student == null || drive == null || app == null) return;

        try {
            String studentEmail = resolveStudentEmail(student);
            if (studentEmail == null || studentEmail.isBlank()) return;

            String dedupKey = "APP_SUBMIT_" + app.getId();
            String html = emailTemplateService.buildStudentApplicationConfirmation(student, drive, app);
            String subject = "[Ascend Confirmation] Application Submitted: " + drive.getTitle() + " (" + drive.getJobRole() + ")";

            emailService.sendHtmlEmailAsync(
                    studentEmail,
                    student.getName(),
                    "STUDENT",
                    subject,
                    html,
                    "APPLICATION_SUBMITTED",
                    app.getId(),
                    dedupKey
            );

        } catch (Exception e) {
            logger.error("Error dispatching application submitted email for app {}: {}", app.getId(), e.getMessage());
        }
    }

    /**
     * Dispatch shortlist notification with next-round details.
     */
    public void notifyCandidateShortlisted(Student student, PlacementDrive drive, PlacementApplication app, String nextRoundDetails) {
        if (student == null || drive == null || app == null) return;

        try {
            String studentEmail = resolveStudentEmail(student);
            if (studentEmail == null || studentEmail.isBlank()) return;

            String portalUrl = baseUrl + "/student";
            String dedupKey = "APP_SHORTLIST_" + app.getId() + "_" + app.getStatus();
            String html = emailTemplateService.buildStudentShortlistNotification(student, drive, app, nextRoundDetails, portalUrl);
            String subject = "[Ascend Shortlisted] Congratulations! Shortlisted for " + drive.getTitle();

            emailService.sendHtmlEmailAsync(
                    studentEmail,
                    student.getName(),
                    "STUDENT",
                    subject,
                    html,
                    "APPLICATION_SHORTLISTED",
                    app.getId(),
                    dedupKey
            );

            if (student.getUserId() != null) {
                notificationRepository.save(new Notification(
                        student.getUserId(),
                        "Shortlisted for " + drive.getTitle(),
                        "Congratulations! You have been shortlisted for " + drive.getTitle() + " (" + drive.getJobRole() + ").",
                        "SHORTLIST"
                ));
            }

        } catch (Exception e) {
            logger.error("Error dispatching shortlist email for app {}: {}", app.getId(), e.getMessage());
        }
    }

    /**
     * Dispatch status update email when candidate is not selected.
     */
    public void notifyCandidateNotSelected(Student student, PlacementDrive drive, PlacementApplication app) {
        if (student == null || drive == null || app == null) return;

        try {
            String studentEmail = resolveStudentEmail(student);
            if (studentEmail == null || studentEmail.isBlank()) return;

            String portalUrl = baseUrl + "/student";
            String dedupKey = "APP_REJECT_" + app.getId() + "_" + app.getStatus();
            String html = emailTemplateService.buildStudentRejectionNotification(student, drive, portalUrl);
            String subject = "[Ascend Placement Update] Status Update: " + drive.getTitle();

            emailService.sendHtmlEmailAsync(
                    studentEmail,
                    student.getName(),
                    "STUDENT",
                    subject,
                    html,
                    "APPLICATION_REJECTED",
                    app.getId(),
                    dedupKey
            );

            if (student.getUserId() != null) {
                notificationRepository.save(new Notification(
                        student.getUserId(),
                        "Application Status Update: " + drive.getTitle(),
                        "Your application for " + drive.getTitle() + " has concluded evaluation.",
                        "APPLICATION"
                ));
            }

        } catch (Exception e) {
            logger.error("Error dispatching rejection email for app {}: {}", app.getId(), e.getMessage());
        }
    }

    /**
     * Dispatch assessment scheduled email.
     */
    public void notifyAssessmentScheduled(Student student, PlacementDrive drive, String dateStr,
                                           String duration, String instructions, String link) {
        if (student == null || drive == null) return;

        try {
            String studentEmail = resolveStudentEmail(student);
            if (studentEmail == null || studentEmail.isBlank()) return;

            String dedupKey = "ASSESSMENT_SCHED_" + drive.getId() + "_" + student.getId() + "_" + dateStr.replaceAll("[^a-zA-Z0-9]", "_");
            String html = emailTemplateService.buildStudentAssessmentScheduled(student, drive, dateStr, duration, instructions, link);
            String subject = "[Ascend Assessment Scheduled] " + drive.getTitle() + " (" + drive.getJobRole() + ")";

            emailService.sendHtmlEmailAsync(
                    studentEmail,
                    student.getName(),
                    "STUDENT",
                    subject,
                    html,
                    "ASSESSMENT_SCHEDULED",
                    drive.getId(),
                    dedupKey
            );

            if (student.getUserId() != null) {
                notificationRepository.save(new Notification(
                        student.getUserId(),
                        "Assessment Scheduled: " + drive.getTitle(),
                        "Technical assessment scheduled for " + dateStr + ". Allotted duration: " + duration,
                        "INFO"
                ));
            }

        } catch (Exception e) {
            logger.error("Error notifying assessment scheduled for student {}: {}", student.getId(), e.getMessage());
        }
    }

    /**
     * Dispatch deadline reminder to eligible students who have not yet applied.
     */
    public int sendDriveDeadlineReminders(PlacementDrive drive, int hoursBefore) {
        if (drive == null || !"PUBLISHED".equalsIgnoreCase(drive.getStatus())) return 0;

        int sentCount = 0;
        try {
            String driveUrl = baseUrl + "/student";
            List<Student> students = studentRepository.findAll();
            Set<String> appliedStudentIds = new HashSet<>(applicationRepository.findByDriveId(drive.getId())
                    .stream().map(PlacementApplication::getStudentId).toList());

            Map<String, Object> criteria = parseCriteria(drive.getEligibilityCriteria());
            Double minCgpa = criteria.containsKey("minCgpa") ? ((Number) criteria.get("minCgpa")).doubleValue() : null;
            Integer maxBacklogs = criteria.containsKey("maxBacklogs") ? ((Number) criteria.get("maxBacklogs")).intValue() : null;
            List<String> allowedDepts = extractDepartments(criteria);
            List<Integer> allowedYears = extractIntList(criteria, "allowedYears");
            List<Integer> allowedGradYears = extractIntList(criteria, "allowedGradYears");

            for (Student student : students) {
                // If already applied, no need for reminder
                if (appliedStudentIds.contains(student.getId())) continue;

                // Check eligibility
                if (minCgpa != null && student.getCgpa() != null && student.getCgpa() < minCgpa) continue;
                if (maxBacklogs != null && student.getBacklogs() != null && student.getBacklogs() > maxBacklogs) continue;
                if (!allowedDepts.isEmpty() && !RguktUtils.isDepartmentEligible(allowedDepts, student.getDepartment())) continue;
                if (!RguktUtils.isYearEligible(allowedYears, allowedGradYears, student.getYear(), student.getGraduationYear())) continue;

                String studentEmail = resolveStudentEmail(student);
                if (studentEmail == null || studentEmail.isBlank()) continue;

                String dedupKey = "DEADLINE_REMIND_" + drive.getId() + "_" + student.getId() + "_" + hoursBefore + "H";
                String html = emailTemplateService.buildStudentDeadlineReminder(student, drive, hoursBefore, driveUrl);
                String subject = "[Ascend Reminder] " + hoursBefore + " Hours Remaining to Apply: " + drive.getTitle();

                emailService.sendHtmlEmailAsync(
                        studentEmail,
                        student.getName(),
                        "STUDENT",
                        subject,
                        html,
                        "DEADLINE_REMINDER",
                        drive.getId(),
                        dedupKey
                );
                sentCount++;
            }

        } catch (Exception e) {
            logger.error("Error sending deadline reminders for drive {}: {}", drive.getId(), e.getMessage());
        }

        return sentCount;
    }

    // =========================================================================
    // 3. TPO DAILY SUMMARY WORKFLOW
    // =========================================================================

    /**
     * Consolidates all drive application activity into a single daily digest for TPOs.
     * Prevents flooding TPO inboxes with individual applicant emails.
     */
    public boolean sendTpoDailySummary() {
        try {
            List<PlacementDrive> drives = driveRepository.findAll();
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

            List<Map<String, Object>> driveStats = new ArrayList<>();
            for (PlacementDrive drive : drives) {
                List<PlacementApplication> apps = applicationRepository.findByDriveId(drive.getId());
                long totalApps = apps.size();
                long newToday = apps.stream()
                        .filter(a -> a.getAppliedAt() != null && a.getAppliedAt().isAfter(startOfDay))
                        .count();
                long shortlisted = apps.stream()
                        .filter(a -> "SHORTLISTED".equalsIgnoreCase(a.getStatus()) || "SELECTED".equalsIgnoreCase(a.getStatus()))
                        .count();

                if (totalApps > 0 || "PUBLISHED".equalsIgnoreCase(drive.getStatus())) {
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("company", drive.getTitle());
                    stat.put("role", drive.getJobRole());
                    stat.put("totalApplications", totalApps);
                    stat.put("newToday", newToday);
                    stat.put("shortlistedCount", shortlisted);
                    driveStats.add(stat);
                }
            }

            String dashboardUrl = baseUrl + "/officer";
            List<PlacementOfficer> officers = officerRepository.findAll();

            if (officers.isEmpty()) {
                PlacementOfficer dummy = new PlacementOfficer();
                dummy.setName("Head Training & Placement Officer");
                String html = emailTemplateService.buildTpoDailySummary(dummy, driveStats, dashboardUrl);
                String dedupKey = "TPO_DAILY_SUMMARY_" + LocalDate.now() + "_DEFAULT";

                emailService.sendHtmlEmailAsync(
                        "tpo@rguktsklm.ac.in",
                        dummy.getName(),
                        "TPO",
                        "Daily Placement Activity Summary – Ascend (" + LocalDate.now() + ")",
                        html,
                        "TPO_DAILY_SUMMARY",
                        "DAILY_SUMMARY",
                        dedupKey
                );
            } else {
                for (PlacementOfficer officer : officers) {
                    String officerEmail = resolveOfficerEmail(officer);
                    String dedupKey = "TPO_DAILY_SUMMARY_" + LocalDate.now() + "_" + officer.getId();
                    String html = emailTemplateService.buildTpoDailySummary(officer, driveStats, dashboardUrl);

                    emailService.sendHtmlEmailAsync(
                            officerEmail,
                            officer.getName(),
                            "TPO",
                            "Daily Placement Activity Summary – Ascend (" + LocalDate.now() + ")",
                            html,
                            "TPO_DAILY_SUMMARY",
                            "DAILY_SUMMARY",
                            dedupKey
                    );
                }
            }

            return true;
        } catch (Exception e) {
            logger.error("Error generating and dispatching TPO daily summary: {}", e.getMessage(), e);
            sendAdminSystemAlert("TPO Daily Summary Generation Error",
                    "An error occurred while compiling the daily summary for TPOs.", e.getMessage());
            return false;
        }
    }

    // =========================================================================
    // 4. ADMIN SYSTEM TELEMETRY ALERT
    // =========================================================================

    public void sendAdminSystemAlert(String title, String details, String technicalError) {
        try {
            String adminUrl = baseUrl + "/admin";
            String html = emailTemplateService.buildAdminSystemAlert(title, details, technicalError, adminUrl);
            String dedupKey = "ADMIN_SYS_ALERT_" + UUID.randomUUID();

            emailService.sendHtmlEmailAsync(
                    adminEmail,
                    "Ascend System Administrator",
                    "ADMIN",
                    "[Ascend System Alert] " + title,
                    html,
                    "ADMIN_SYSTEM_ALERT",
                    "SYSTEM",
                    dedupKey
            );
        } catch (Exception e) {
            logger.error("Error sending admin system alert: {}", e.getMessage());
        }
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private String resolveStudentEmail(Student student) {
        if (student.getEmail() != null && !student.getEmail().isBlank()) {
            return student.getEmail().trim();
        }
        if (student.getUserId() != null) {
            return userRepository.findById(student.getUserId())
                    .map(User::getEmail)
                    .orElse(null);
        }
        return null;
    }

    private String resolveOfficerEmail(PlacementOfficer officer) {
        if (officer.getUserId() != null) {
            return userRepository.findById(officer.getUserId())
                    .map(User::getEmail)
                    .orElse("tpo@rguktsklm.ac.in");
        }
        return "tpo@rguktsklm.ac.in";
    }

    private Map<String, Object> parseCriteria(String json) {
        if (json == null || json.isBlank() || "{}".equals(json.trim())) {
            return Collections.emptyMap();
        }
        try {
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    @SuppressWarnings("unchecked")
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

    @SuppressWarnings("unchecked")
    private List<Integer> extractIntList(Map<String, Object> crit, String key) {
        List<Integer> result = new ArrayList<>();
        if (crit.containsKey(key) && crit.get(key) instanceof List) {
            for (Object item : (List<?>) crit.get(key)) {
                if (item instanceof Number) {
                    result.add(((Number) item).intValue());
                } else if (item != null) {
                    try {
                        result.add(Integer.parseInt(item.toString().trim()));
                    } catch (Exception ignored) {}
                }
            }
        }
        return result;
    }
}
