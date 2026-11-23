package com.placement.system.repository;

import com.placement.system.model.LearningRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface LearningRecommendationRepository extends JpaRepository<LearningRecommendation, String> {
    List<LearningRecommendation> findByAnalysisReportId(String analysisReportId);

    @Transactional
    void deleteByAnalysisReportId(String analysisReportId);
}
