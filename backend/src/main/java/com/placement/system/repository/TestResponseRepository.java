package com.placement.system.repository;

import com.placement.system.model.TestResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestResponseRepository extends JpaRepository<TestResponse, String> {
    List<TestResponse> findByTestAttemptId(String testAttemptId);
}
