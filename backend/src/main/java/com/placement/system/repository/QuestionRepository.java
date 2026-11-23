package com.placement.system.repository;

import com.placement.system.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findByTestCategoryId(String testCategoryId);
    List<Question> findByTestCategoryIdAndDifficulty(String testCategoryId, String difficulty);
    Optional<Question> findByTestCategoryIdAndQuestionText(String testCategoryId, String questionText);
    long countByTestCategoryId(String testCategoryId);
}
