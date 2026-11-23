package com.placement.system.repository;

import com.placement.system.model.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, String> {
    Optional<EmailOtp> findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(String email);

    @Transactional
    @Modifying
    @Query("DELETE FROM EmailOtp o WHERE o.expiresAt < :now OR o.email = :email")
    void cleanupOldOtps(String email, LocalDateTime now);
}
