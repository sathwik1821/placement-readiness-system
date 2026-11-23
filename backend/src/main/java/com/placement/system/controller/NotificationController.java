package com.placement.system.controller;

import com.placement.system.model.Notification;
import com.placement.system.repository.NotificationRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long unread = notificationRepository.countByUserIdAndReadStatusFalse(userId);
        return ResponseEntity.ok(Map.of("notifications", list, "unreadCount", unread));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n == null) return ResponseEntity.notFound().build();
        if (!n.getUserId().equals(userId)) return ResponseEntity.status(403).build();

        n.setReadStatus(true);
        n = notificationRepository.save(n);
        return ResponseEntity.ok(n);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setReadStatus(true);
        }
        notificationRepository.saveAll(list);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
