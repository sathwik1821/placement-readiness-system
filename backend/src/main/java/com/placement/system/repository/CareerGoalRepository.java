package com.placement.system.repository;

import com.placement.system.model.CareerGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerGoalRepository extends JpaRepository<CareerGoal, String> {
    Optional<CareerGoal> findByStudentId(String studentId);
}
