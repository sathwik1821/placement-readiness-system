package com.placement.system.repository;

import com.placement.system.model.PlacementApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, String> {
    List<PlacementApplication> findByStudentIdOrderByAppliedAtDesc(String studentId);
    List<PlacementApplication> findByDriveIdOrderByAppliedAtDesc(String driveId);
    List<PlacementApplication> findByDriveId(String driveId);
    Optional<PlacementApplication> findByStudentIdAndDriveId(String studentId, String driveId);
    long countByDriveId(String driveId);
}
