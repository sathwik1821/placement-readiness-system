package com.placement.system.repository;

import com.placement.system.model.MockInterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockInterviewSessionRepository extends JpaRepository<MockInterviewSession, String> {
    List<MockInterviewSession> findByStudentIdOrderByCreatedAtDesc(String studentId);
}
