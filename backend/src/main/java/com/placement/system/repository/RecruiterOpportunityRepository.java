package com.placement.system.repository;

import com.placement.system.model.RecruiterOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruiterOpportunityRepository extends JpaRepository<RecruiterOpportunity, String> {
    Optional<RecruiterOpportunity> findByReferenceId(String referenceId);
    Optional<RecruiterOpportunity> findBySecureToken(String secureToken);
    List<RecruiterOpportunity> findByStatusOrderByCreatedAtDesc(String status);
    List<RecruiterOpportunity> findAllByOrderByCreatedAtDesc();
    List<RecruiterOpportunity> findByRecruiterEmailOrderByCreatedAtDesc(String recruiterEmail);
}
