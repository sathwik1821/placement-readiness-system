package com.placement.system.repository;

import com.placement.system.model.PlacementOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlacementOfficerRepository extends JpaRepository<PlacementOfficer, String> {
    Optional<PlacementOfficer> findByUserId(String userId);
}
