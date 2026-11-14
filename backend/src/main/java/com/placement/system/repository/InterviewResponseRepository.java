package com.placement.system.repository;

import com.placement.system.model.InterviewResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewResponseRepository extends JpaRepository<InterviewResponse, String> {
    List<InterviewResponse> findBySessionId(String sessionId);
}
