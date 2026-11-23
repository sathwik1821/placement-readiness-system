package com.placement.system.controller;

import com.placement.system.model.Job;
import com.placement.system.model.Student;
import com.placement.system.repository.JobRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.service.DynamicJobService;
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
    private StudentRepository studentRepository;

    @Autowired
    private DynamicJobService dynamicJobService;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    public ResponseEntity<?> getAllJobs() {
        dynamicJobService.ensureCatalogSeeded();
        return ResponseEntity.ok(jobRepository.findByIsActiveTrueOrderByPostedAtDesc());
    }

    /**
     * Dynamic Search & Rank endpoint with live query filtering, domain matching, work mode, and live AI discovery.
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchJobs(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey,
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "domain", required = false) String domain,
            @RequestParam(value = "jobType", required = false) String jobType,
            @RequestParam(value = "workMode", required = false) String workMode,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "sortBy", required = false, defaultValue = "FIT") String sortBy,
            @RequestParam(value = "live", required = false, defaultValue = "false") boolean live) {

        Student student = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
                student = studentRepository.findByUserId(userId).orElse(null);
            } catch (Exception ignored) {}
        }

        List<Map<String, Object>> results = dynamicJobService.searchAndRankJobs(
                student,
                query,
                domain,
                jobType,
                workMode,
                location,
                sortBy,
                live,
                customApiKey
        );

        return ResponseEntity.ok(results);
    }

    /**
     * Personalized recommendations calculated dynamically based on target role, verified skills, and assessments.
     */
    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedJobs(
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);
        if (student == null) return ResponseEntity.ok(List.of());

        List<Map<String, Object>> results = dynamicJobService.searchAndRankJobs(
                student,
                "",
                null,
                null,
                null,
                null,
                "FIT",
                false,
                customApiKey
        );

        return ResponseEntity.ok(results);
    }

    /**
     * Live AI Market Requisition Discovery using Google Gemini LLM.
     */
    @PostMapping("/ai-discover")
    public ResponseEntity<?> discoverLiveMarketJobs(
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey,
            @RequestBody Map<String, String> body) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        Student student = studentRepository.findByUserId(userId).orElse(null);

        String query = body.getOrDefault("query", "Software Engineer");
        String domain = body.getOrDefault("domain", "Software Engineering");
        String location = body.getOrDefault("location", "India");

        List<Map<String, Object>> results = dynamicJobService.searchAndRankJobs(
                student,
                query,
                domain,
                null,
                null,
                location,
                "FIT",
                true,
                customApiKey
        );

        return ResponseEntity.ok(results);
    }

    @PostMapping("/recommend")
    public ResponseEntity<?> refreshRecommendations(
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String customApiKey) {
        return getRecommendedJobs(authHeader, customApiKey);
    }
}
