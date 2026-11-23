package com.placement.system.controller;

import com.placement.system.model.NotificationLog;
import com.placement.system.repository.NotificationLogRepository;
import com.placement.system.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notification-logs")
public class NotificationLogController {

    @Autowired
    private NotificationLogRepository logRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<?> getLogs(
            @RequestParam(value = "recipient", required = false) String recipient,
            @RequestParam(value = "status", required = false) String status) {

        List<NotificationLog> logs;
        if (recipient != null && !recipient.isBlank()) {
            logs = logRepository.findByRecipientEmailOrderByCreatedAtDesc(recipient.trim().toLowerCase());
        } else if (status != null && !status.isBlank()) {
            logs = logRepository.findByDeliveryStatusStartingWithIgnoreCaseOrderByCreatedAtDesc(status.trim());
        } else {
            logs = logRepository.findTop50ByOrderByCreatedAtDesc();
        }

        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLogById(@PathVariable String id) {
        return logRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<?> retryNotification(@PathVariable String id) {
        boolean success = emailService.retryNotification(id);
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Notification retry initiated successfully." : "Log entry not found or cannot be retried."
        ));
    }
}
