package com.placement.system.service;

import com.placement.system.model.PlacementDrive;
import com.placement.system.repository.PlacementDriveRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class NotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(NotificationScheduler.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PlacementDriveRepository driveRepository;

    /**
     * Daily TPO placement activity consolidation digest.
     * Fires automatically at 18:00 (6:00 PM) every day.
     */
    @Scheduled(cron = "${app.scheduler.tpo-daily-summary-cron:0 0 18 * * *}")
    public void runTpoDailySummaryJob() {
        logger.info("Executing scheduled TPO daily summary consolidation job...");
        try {
            boolean dispatched = notificationService.sendTpoDailySummary();
            logger.info("TPO daily summary job execution status: {}", dispatched ? "SUCCESS" : "NO_OP_OR_FAILED");
        } catch (Exception e) {
            logger.error("Error running TPO daily summary scheduled job: {}", e.getMessage(), e);
        }
    }

    /**
     * Application deadline reminder check.
     * Fires every morning at 09:00 (9:00 AM).
     * Finds published drives with deadlines approaching within 24 hours.
     */
    @Scheduled(cron = "${app.scheduler.deadline-reminders-cron:0 0 9 * * *}")
    public void runDeadlineRemindersJob() {
        logger.info("Executing scheduled placement deadline reminder check...");
        try {
            List<PlacementDrive> publishedDrives = driveRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED");
            LocalDateTime now = LocalDateTime.now();

            for (PlacementDrive drive : publishedDrives) {
                if (drive.getDeadline() != null && drive.getDeadline().isAfter(now)) {
                    long hoursLeft = Duration.between(now, drive.getDeadline()).toHours();
                    // Alert when deadline is within 24 hours
                    if (hoursLeft <= 24 && hoursLeft > 0) {
                        logger.info("Sending 24h deadline reminder for drive {} ({} hours remaining)", drive.getTitle(), hoursLeft);
                        notificationService.sendDriveDeadlineReminders(drive, (int) hoursLeft);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error executing deadline reminders job: {}", e.getMessage(), e);
        }
    }
}
