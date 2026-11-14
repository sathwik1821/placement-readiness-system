package com.placement.system.repository;

import com.placement.system.model.TestCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestCategoryRepository extends JpaRepository<TestCategory, String> {
    Optional<TestCategory> findByName(String name);
}
