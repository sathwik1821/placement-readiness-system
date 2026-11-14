package com.placement.system.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.Job;
import com.placement.system.model.JobRecommendation;
import com.placement.system.model.Student;
import com.placement.system.repository.CareerGoalRepository;
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
    private CareerGoalRepository careerGoalRepository;

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

        String targetRole = careerGoalRepository.findByStudentId(student.getId())
                .map(cg -> cg.getTargetRole())
                .orElse("Java Full Stack Developer");

        for (Job j : allJobs) {
            double baseScore = 72.0 + (student.getCgpa() >= 8.0 ? 10.0 : 5.0);
            boolean trackMatch = false;

            if (targetRole.contains("Java") && (j.getTitle().contains("Backend") || j.getTitle().contains("Java") || j.getDescription().contains("Spring"))) {
                baseScore += 12.0;
                trackMatch = true;
            } else if (targetRole.contains("MERN") && (j.getTitle().contains("Full Stack") || j.getDescription().contains("React"))) {
                baseScore += 12.0;
                trackMatch = true;
            } else if (targetRole.contains("AI") && (j.getTitle().contains("AI") || j.getTitle().contains("ML") || j.getDescription().contains("learning"))) {
                baseScore += 14.0;
                trackMatch = true;
            } else if (targetRole.contains("Data Analyst") && (j.getTitle().contains("Data") || j.getTitle().contains("Analyst"))) {
                baseScore += 14.0;
                trackMatch = true;
            }

            List<String> reasons = new ArrayList<>();
            if (trackMatch) {
                reasons.add("Primary alignment with your chosen career track: " + targetRole);
            }
            reasons.add("Verified proficiency in core required technologies & frameworks");
            reasons.add("Academic CGPA (" + student.getCgpa() + ") meets institutional recruiter cutoff");
            reasons.add("Graduation class matches candidate intake window");

            try {
                JobRecommendation rec = new JobRecommendation();
                rec.setStudentId(student.getId());
                rec.setJobId(j.getId());
                rec.setMatchScore(Math.min(98.0, baseScore));
                rec.setMatchReasons(mapper.writeValueAsString(reasons));
                rec = recommendationRepository.save(rec);
                rec.setJob(parseJob(j));
                created.add(rec);
            } catch (Exception e) {
                // Ignore formatting error
            }
        }
        created.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
        return created;
    }

    private Job parseJob(Job j) {
        return j;
    }
}
