package com.placement.system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_responses")
public class TestResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String testAttemptId;

    @Column(nullable = false)
    private String questionId;

    private String selectedAnswer = "";
    private Boolean isCorrect = false;
    private Integer timeTaken = 0;

    public TestResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTestAttemptId() { return testAttemptId; }
    public void setTestAttemptId(String testAttemptId) { this.testAttemptId = testAttemptId; }
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public String getSelectedAnswer() { return selectedAnswer; }
    public void setSelectedAnswer(String selectedAnswer) { this.selectedAnswer = selectedAnswer; }
    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }
    public Integer getTimeTaken() { return timeTaken; }
    public void setTimeTaken(Integer timeTaken) { this.timeTaken = timeTaken; }
}
