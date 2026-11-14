package com.placement.system.repository;

import com.placement.system.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, String> {
    List<Job> findByIsActiveTrueOrderByPostedAtDesc();
    Optional<Job> findByTitleAndCompany(String title, String company);
}
