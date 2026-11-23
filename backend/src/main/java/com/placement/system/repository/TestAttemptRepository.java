package com.placement.system.repository;

import com.placement.system.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, String> {
    List<TestAttempt> findByStudentIdOrderByStartedAtDesc(String studentId);
    List<TestAttempt> findByStudentIdAndStatusOrderByCompletedAtDesc(String studentId, String status);
    long countByTestCategoryId(String testCategoryId);
    List<TestAttempt> findByTestCategoryId(String testCategoryId);
}
