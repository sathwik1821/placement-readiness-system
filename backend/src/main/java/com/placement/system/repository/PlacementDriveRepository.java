package com.placement.system.repository;

import com.placement.system.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, String> {
    List<PlacementDrive> findByStatusOrderByCreatedAtDesc(String status);
    List<PlacementDrive> findAllByOrderByCreatedAtDesc();
    List<PlacementDrive> findByCompanyIdOrderByCreatedAtDesc(String companyId);
    Optional<PlacementDrive> findByTitle(String title);
}
