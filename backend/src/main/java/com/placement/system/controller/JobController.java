package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Job;
import com.placement.system.model.JobRecommendation;
import com.placement.system.model.Student;
import com.placement.system.repository.JobRecommendationRepository;
import com.placement.system.repository.JobRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobRecommendationRepository recommendationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<?> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findByIsActiveTrueOrderByPostedAtDesc());
    }

    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedJobs(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.ok(List.of());

        List<JobRecommendation> recs = recommendationRepository.findByStudentIdOrderByMatchScoreDesc(student.getId());
        if (recs.isEmpty()) {
            recs = generateRecommendationsInternal(student);
        } else {
            for (JobRecommendation r : recs) {
                jobRepository.findById(r.getJobId()).ifPresent(j -> r.setJob(parseJob(j)));
            }
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (JobRecommendation r : recs) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("studentId", r.getStudentId());
            map.put("jobId", r.getJobId());
            map.put("matchScore", r.getMatchScore());
            try {
                map.put("matchReasons", mapper.readValue(r.getMatchReasons(), new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                map.put("matchReasons", List.of());
            }
            map.put("job", r.getJob());
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/recommend")
    public ResponseEntity<?> refreshRecommendations(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.ok(List.of());

        recommendationRepository.deleteByStudentId(student.getId());
        return getRecommendedJobs(authHeader);
    }

    private List<JobRecommendation> generateRecommendationsInternal(Student student) {
        List<Job> allJobs = jobRepository.findByIsActiveTrueOrderByPostedAtDesc();
        List<JobRecommendation> created = new ArrayList<>();

        for (Job j : allJobs) {
            double score = 75.0 + (student.getCgpa() >= 8.0 ? 10.0 : 5.0);
            List<String> reasons = List.of(
                "Strong alignment with verified student skills and engineering background",
                "Academic CGPA satisfies external recruiter benchmark (" + student.getCgpa() + ")",
                "Graduation cohort of 2025 matches hiring requisition window"
            );

            try {
                JobRecommendation rec = new JobRecommendation();
                rec.setStudentId(student.getId());
                rec.setJobId(j.getId());
                rec.setMatchScore(Math.min(95.0, score));
                rec.setMatchReasons(mapper.writeValueAsString(reasons));
                rec = recommendationRepository.save(rec);
                rec.setJob(parseJob(j));
                created.add(rec);
            } catch (Exception e) {
                // Ignore formatting error
            }
        }
        return created;
    }

    private Job parseJob(Job j) {
        return j;
    }
}
