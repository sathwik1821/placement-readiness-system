package com.placement.system.repository;

import com.placement.system.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, String> {
    boolean existsByDeduplicationKeyAndDeliveryStatus(String deduplicationKey, String deliveryStatus);
    Optional<NotificationLog> findByDeduplicationKey(String deduplicationKey);
    List<NotificationLog> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    List<NotificationLog> findByDeliveryStatusOrderByCreatedAtAsc(String deliveryStatus);
    List<NotificationLog> findByDeliveryStatusStartingWithIgnoreCaseOrderByCreatedAtDesc(String deliveryStatus);
    List<NotificationLog> findTop50ByOrderByCreatedAtDesc();
}
