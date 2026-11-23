package com.placement.system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.CareerGoal;
import com.placement.system.model.Student;
import com.placement.system.repository.CareerGoalRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private com.placement.system.repository.UserRepository userRepository;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        CareerGoal goal = careerGoalRepository.findByStudentId(student.getId()).orElse(null);

        String userEmail = student.getEmail() != null && !student.getEmail().isBlank()
                ? student.getEmail()
                : userRepository.findById(student.getUserId()).map(com.placement.system.model.User::getEmail).orElse("");

        Map<String, Object> res = new HashMap<>();
        res.put("id", student.getId());
        res.put("userId", student.getUserId());
        res.put("name", student.getName());
        res.put("email", userEmail);
        res.put("rollNumber", student.getRollNumber() != null ? student.getRollNumber() : "");
        res.put("college", student.getCollege() != null ? student.getCollege() : "RGUKT Srikakulam");
        res.put("batch", student.getBatch() != null ? student.getBatch() : "2027 Graduating Batch • B.Tech E4 (Final Year)");
        res.put("year", student.getYear() != null ? student.getYear() : 4);
        res.put("yearOfStudy", student.getYearOfStudy() != null ? student.getYearOfStudy() : "4th Year (E4)");
        res.put("department", student.getDepartment());
        res.put("semester", student.getSemester());
        res.put("cgpa", student.getCgpa());
        res.put("graduationYear", student.getGraduationYear());
        res.put("backlogs", student.getBacklogs());
        res.put("phone", student.getPhone());
        res.put("skills", student.getSkills());
        res.put("interests", student.getInterests());
        res.put("portfolioLink", student.getPortfolioLink());
        res.put("resumeUrl", student.getResumeUrl());
        res.put("resumeFileName", student.getResumeFileName() != null ? student.getResumeFileName() : "");
        res.put("careerGoal", goal);

        return ResponseEntity.ok(res);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Object> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        ObjectMapper mapper = new ObjectMapper();
        try {
            if (body.containsKey("name")) student.setName((String) body.get("name"));
            if (body.containsKey("department")) student.setDepartment((String) body.get("department"));
            if (body.containsKey("rollNumber")) student.setRollNumber((String) body.get("rollNumber"));
            if (body.containsKey("college")) student.setCollege((String) body.get("college"));
            if (body.containsKey("batch")) student.setBatch((String) body.get("batch"));
            if (body.containsKey("year")) student.setYear(((Number) body.get("year")).intValue());
            if (body.containsKey("yearOfStudy")) student.setYearOfStudy((String) body.get("yearOfStudy"));
            if (body.containsKey("semester")) student.setSemester(((Number) body.get("semester")).intValue());
            if (body.containsKey("cgpa")) student.setCgpa(((Number) body.get("cgpa")).doubleValue());
            if (body.containsKey("graduationYear")) student.setGraduationYear(((Number) body.get("graduationYear")).intValue());
            if (body.containsKey("backlogs")) student.setBacklogs(((Number) body.get("backlogs")).intValue());
            if (body.containsKey("phone")) student.setPhone((String) body.get("phone"));
            if (body.containsKey("portfolioLink")) student.setPortfolioLink((String) body.get("portfolioLink"));
            if (body.containsKey("resumeUrl")) student.setResumeUrl((String) body.get("resumeUrl"));
            if (body.containsKey("resumeFileName")) student.setResumeFileName((String) body.get("resumeFileName"));

            if (body.containsKey("skills")) {
                Object skillsObj = body.get("skills");
                student.setSkills(skillsObj instanceof String ? (String) skillsObj : mapper.writeValueAsString(skillsObj));
            }
            if (body.containsKey("interests")) {
                Object intObj = body.get("interests");
                student.setInterests(intObj instanceof String ? (String) intObj : mapper.writeValueAsString(intObj));
            }
            student.setUpdatedAt(LocalDateTime.now());
            student = studentRepository.save(student);
            return ResponseEntity.ok(student);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/career-goal")
    public ResponseEntity<?> updateCareerGoal(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.notFound().build();

        CareerGoal goal = careerGoalRepository.findByStudentId(student.getId()).orElseGet(() -> {
            CareerGoal g = new CareerGoal();
            g.setStudentId(student.getId());
            return g;
        });

        if (body.containsKey("targetRole")) goal.setTargetRole(body.get("targetRole"));
        if (body.containsKey("targetDomain")) goal.setTargetDomain(body.get("targetDomain"));
        if (body.containsKey("targetIndustry")) goal.setTargetIndustry(body.get("targetIndustry"));

        goal = careerGoalRepository.save(goal);
        return ResponseEntity.ok(goal);
    }
}
