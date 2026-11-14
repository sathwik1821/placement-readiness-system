package com.placement.system.repository;

import com.placement.system.model.CompanyFeedbackReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyFeedbackReportRepository extends JpaRepository<CompanyFeedbackReport, String> {
    Optional<CompanyFeedbackReport> findFirstByDriveIdOrderByGeneratedAtDesc(String driveId);
}
