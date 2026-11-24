package com.placement.system.scheduler;

import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.PlacementOfficer;
import com.placement.system.model.User;
import com.placement.system.repository.PlacementApplicationRepository;
import com.placement.system.repository.PlacementDriveRepository;
import com.placement.system.repository.PlacementOfficerRepository;
import com.placement.system.repository.UserRepository;
import com.placement.system.service.EmailService;
import com.placement.system.service.EmailTemplateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class TpoDailyDigestScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TpoDailyDigestScheduler.class);

    @Autowired
    private PlacementOfficerRepository officerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private PlacementApplicationRepository applicationRepository;

    @Autowired
    private EmailTemplateService emailTemplateService;

    @Autowired
    private EmailService emailService;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    /**
     * Executes daily at 18:00 (6:00 PM) to dispatch consolidated placement activity digests to TPOs.
     */
    @Scheduled(cron = "${app.notifications.tpo-daily-digest-cron:0 0 18 * * *}")
    public int dispatchDailyDigest() {
        logger.info("Executing scheduled TPO Daily Placement Digest compilation...");

        List<PlacementOfficer> officers = officerRepository.findAll();
        if (officers.isEmpty()) {
            logger.info("No registered Placement Officers found for daily digest dispatch.");
            return 0;
        }

        List<PlacementDrive> drives = driveRepository.findAll();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        List<Map<String, Object>> driveStats = new ArrayList<>();
        for (PlacementDrive drive : drives) {
            List<PlacementApplication> apps = applicationRepository.findByDriveId(drive.getId());
            long total = apps.size();
            long newToday = apps.stream()
                    .filter(a -> a.getAppliedAt() != null && a.getAppliedAt().isAfter(todayStart))
                    .count();
            long shortlisted = apps.stream()
                    .filter(a -> "SHORTLISTED".equalsIgnoreCase(a.getStatus()))
                    .count();

            Map<String, Object> stat = new HashMap<>();
            stat.put("companyName", drive.getTitle() != null ? drive.getTitle() : "Campus Placement Drive");
            stat.put("jobRole", drive.getJobRole() != null ? drive.getJobRole() : drive.getTitle());
            stat.put("totalApplications", total);
            stat.put("newToday", newToday);
            stat.put("shortlisted", shortlisted);
            stat.put("driveUrl", baseUrl + "/officer/drives/" + drive.getId());
            driveStats.add(stat);
        }

        String dashboardUrl = baseUrl + "/officer/dashboard";
        int sentCount = 0;
        String todayStr = LocalDate.now().toString();

        for (PlacementOfficer officer : officers) {
            String officerEmail = userRepository.findById(officer.getUserId())
                    .map(User::getEmail)
                    .orElse(null);

            if (officerEmail == null || officerEmail.isBlank()) continue;

            String subject = "Daily Placement Activity Summary – Ascend (" + todayStr + ")";
            String html = emailTemplateService.buildTpoDailySummary(officer, driveStats, dashboardUrl);
            String deduplicationKey = "TPO_DAILY_DIGEST_" + officer.getId() + "_" + todayStr;

            emailService.sendHtmlEmailAsync(
                    officerEmail,
                    officer.getName() != null ? officer.getName() : "Placement Officer",
                    "PLACEMENT_OFFICER",
                    subject,
                    html,
                    "TPO_DAILY_SUMMARY",
                    officer.getId(),
                    deduplicationKey
            );
            sentCount++;
        }

        logger.info("TPO Daily Placement Digest dispatched to {} officers for date: {}", sentCount, todayStr);
        return sentCount;
    }
}
