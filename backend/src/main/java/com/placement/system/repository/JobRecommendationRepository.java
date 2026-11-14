package com.placement.system.repository;

import com.placement.system.model.JobRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRecommendationRepository extends JpaRepository<JobRecommendation, String> {
    List<JobRecommendation> findByStudentIdOrderByMatchScoreDesc(String studentId);
    void deleteByStudentId(String studentId);
}
