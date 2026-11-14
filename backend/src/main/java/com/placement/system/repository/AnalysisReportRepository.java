package com.placement.system.repository;

import com.placement.system.model.AnalysisReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, String> {
    Optional<AnalysisReport> findFirstByStudentIdOrderByGeneratedAtDesc(String studentId);
}
