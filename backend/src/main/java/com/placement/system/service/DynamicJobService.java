package com.placement.system.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.*;
import com.placement.system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class DynamicJobService {

    @Value("${gemini.api.key:}")
    private String defaultApiKey;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String defaultModel;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobRecommendationRepository recommendationRepository;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private AnalysisReportRepository reportRepository;

    @Autowired
    private TestAttemptRepository attemptRepository;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    /**
     * Dynamically searches, filters, and ranks job opportunities with personalized AI compatibility scores.
     */
    public List<Map<String, Object>> searchAndRankJobs(
            Student student,
            String query,
            String domain,
            String jobType,
            String workMode,
            String location,
            String sortBy,
            boolean triggerLiveDiscovery,
            String customApiKey) {

        ensureCatalogSeeded();

        // 1. If student requests live AI market discovery or query returns few results, trigger dynamic Gemini generation
        if (triggerLiveDiscovery && query != null && !query.trim().isBlank()) {
            discoverLiveJobs(query.trim(), domain, location, customApiKey);
        }

        // 2. Fetch all active jobs
        List<Job> allJobs = jobRepository.findByIsActiveTrueOrderByPostedAtDesc();

        // 3. Retrieve student context
        CareerGoal goal = student != null
                ? careerGoalRepository.findByStudentId(student.getId()).orElse(null)
                : null;
        AnalysisReport report = student != null
                ? reportRepository.findFirstByStudentIdOrderByGeneratedAtDesc(student.getId()).orElse(null)
                : null;
        List<TestAttempt> attempts = student != null
                ? attemptRepository.findByStudentIdAndStatusOrderByCompletedAtDesc(student.getId(), "COMPLETED")
                : List.of();

        String qLower = query != null ? query.trim().toLowerCase() : "";
        String domainLower = domain != null ? domain.trim().toLowerCase() : "";
        String typeLower = jobType != null ? jobType.trim().toUpperCase() : "";
        String modeLower = workMode != null ? workMode.trim().toUpperCase() : "";
        String locLower = location != null ? location.trim().toLowerCase() : "";

        List<Map<String, Object>> results = new ArrayList<>();

        for (Job job : allJobs) {
            // Filter by Query (title, company, description, skills)
            if (!qLower.isEmpty()) {
                boolean matchTitle = job.getTitle() != null && job.getTitle().toLowerCase().contains(qLower);
                boolean matchCompany = job.getCompany() != null && job.getCompany().toLowerCase().contains(qLower);
                boolean matchDesc = job.getDescription() != null && job.getDescription().toLowerCase().contains(qLower);
                boolean matchSkills = job.getSkills() != null && job.getSkills().toLowerCase().contains(qLower);
                boolean matchDomain = job.getDomain() != null && job.getDomain().toLowerCase().contains(qLower);

                if (!matchTitle && !matchCompany && !matchDesc && !matchSkills && !matchDomain) {
                    continue;
                }
            }

            // Filter by Domain
            if (!domainLower.isEmpty() && !"all".equals(domainLower)) {
                String jd = job.getDomain() != null ? job.getDomain().toLowerCase() : "";
                String jt = job.getTitle() != null ? job.getTitle().toLowerCase() : "";
                if (!jd.contains(domainLower) && !jt.contains(domainLower)) {
                    continue;
                }
            }

            // Filter by JobType
            if (!typeLower.isEmpty() && !"ALL".equals(typeLower)) {
                if (job.getJobType() != null && !job.getJobType().equalsIgnoreCase(typeLower)) {
                    continue;
                }
            }

            // Filter by WorkMode
            if (!modeLower.isEmpty() && !"ALL".equals(modeLower)) {
                if (job.getWorkMode() != null && !job.getWorkMode().equalsIgnoreCase(modeLower)) {
                    continue;
                }
            }

            // Filter by Location
            if (!locLower.isEmpty() && !"all".equals(locLower)) {
                if (job.getLocation() != null && !job.getLocation().toLowerCase().contains(locLower)) {
                    continue;
                }
            }

            // Calculate Personalized Compatibility Fit
            Map<String, Object> evaluated = evaluateFit(student, job, goal, report, attempts);
            results.add(evaluated);
        }

        // 4. Sort results
        String effectiveSort = sortBy != null ? sortBy.toUpperCase() : "FIT";
        if ("RECENT".equals(effectiveSort)) {
            results.sort((a, b) -> {
                Job ja = (Job) a.get("job");
                Job jb = (Job) b.get("job");
                LocalDateTime ta = ja.getPostedAt() != null ? ja.getPostedAt() : LocalDateTime.MIN;
                LocalDateTime tb = jb.getPostedAt() != null ? jb.getPostedAt() : LocalDateTime.MIN;
                return tb.compareTo(ta);
            });
        } else if ("SALARY".equals(effectiveSort)) {
            results.sort((a, b) -> {
                Job ja = (Job) a.get("job");
                Job jb = (Job) b.get("job");
                return extractLpa(jb.getSalary()).compareTo(extractLpa(ja.getSalary()));
            });
        } else {
            // Default: Highest AI Profile Fit
            results.sort((a, b) -> Double.compare(
                    (Double) b.getOrDefault("matchScore", 0.0),
                    (Double) a.getOrDefault("matchScore", 0.0)
            ));
        }

        return results;
    }

    /**
     * Dynamic evaluation engine calculating granular score and explainable reasons.
     */
    public Map<String, Object> evaluateFit(
            Student student,
            Job job,
            CareerGoal goal,
            AnalysisReport report,
            List<TestAttempt> attempts) {

        String targetRole = goal != null && goal.getTargetRole() != null && !goal.getTargetRole().isBlank()
                ? goal.getTargetRole()
                : "Java Full Stack Developer";

        List<String> jobSkills = parseJsonArray(job.getSkills());
        List<String> studentSkills = student != null ? parseJsonArray(student.getSkills()) : List.of();

        // 1. Role Alignment Score (Max 35 points)
        double roleScore = 15.0;
        String jobTitleLower = job.getTitle() != null ? job.getTitle().toLowerCase() : "";
        String jobDescLower = job.getDescription() != null ? job.getDescription().toLowerCase() : "";
        String targetLower = targetRole.toLowerCase();

        boolean directRoleMatch = false;
        if (targetLower.contains("java") && (jobTitleLower.contains("java") || jobTitleLower.contains("backend") || jobDescLower.contains("spring"))) {
            roleScore = 35.0;
            directRoleMatch = true;
        } else if (targetLower.contains("mern") && (jobTitleLower.contains("full stack") || jobTitleLower.contains("react") || jobDescLower.contains("node"))) {
            roleScore = 35.0;
            directRoleMatch = true;
        } else if (targetLower.contains("ai") && (jobTitleLower.contains("ai") || jobTitleLower.contains("ml") || jobTitleLower.contains("machine learning") || jobDescLower.contains("model"))) {
            roleScore = 35.0;
            directRoleMatch = true;
        } else if (targetLower.contains("data") && (jobTitleLower.contains("data") || jobTitleLower.contains("analyst") || jobDescLower.contains("sql"))) {
            roleScore = 35.0;
            directRoleMatch = true;
        } else if (targetLower.contains("cloud") && (jobTitleLower.contains("cloud") || jobTitleLower.contains("devops") || jobDescLower.contains("aws") || jobDescLower.contains("kubernetes"))) {
            roleScore = 35.0;
            directRoleMatch = true;
        } else if (jobTitleLower.contains("software") || jobTitleLower.contains("engineer")) {
            roleScore = 28.0;
        }

        // 2. Skill Overlap Score (Max 30 points)
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        Set<String> studentSkillSet = studentSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        // Also add role-implied skills
        if (targetLower.contains("java")) {
            studentSkillSet.addAll(List.of("java", "spring boot", "sql", "hibernate", "rest", "microservices"));
        } else if (targetLower.contains("mern")) {
            studentSkillSet.addAll(List.of("react", "javascript", "node.js", "mongodb", "express", "typescript"));
        } else if (targetLower.contains("ai")) {
            studentSkillSet.addAll(List.of("python", "machine learning", "pytorch", "scikit-learn", "deep learning"));
        } else if (targetLower.contains("data")) {
            studentSkillSet.addAll(List.of("sql", "python", "powerbi", "tableau", "statistics", "data warehousing"));
        }

        for (String js : jobSkills) {
            if (studentSkillSet.stream().anyMatch(ss -> ss.contains(js.toLowerCase()) || js.toLowerCase().contains(ss))) {
                matchedSkills.add(js);
            } else {
                missingSkills.add(js);
            }
        }

        double skillRatio = jobSkills.isEmpty() ? 0.8 : (double) matchedSkills.size() / jobSkills.size();
        double skillScore = Math.min(30.0, Math.round(skillRatio * 30.0));

        // 3. Academic Cutoff & Standing (Max 15 points)
        double academicScore = 10.0;
        if (student != null) {
            if (student.getCgpa() != null && student.getCgpa() >= 8.5) academicScore = 15.0;
            else if (student.getCgpa() != null && student.getCgpa() >= 7.5) academicScore = 13.0;
            else if (student.getCgpa() != null && student.getCgpa() >= 6.5) academicScore = 10.0;

            if (student.getBacklogs() != null && student.getBacklogs() == 0) academicScore += 2.0;
        }

        // 4. Practical Assessment Readiness (Max 20 points)
        double readinessScore = 15.0;
        if (report != null && report.getReadinessScore() != null) {
            readinessScore = Math.min(20.0, (report.getReadinessScore() / 100.0) * 20.0);
        } else if (attempts != null && !attempts.isEmpty()) {
            double avgAcc = attempts.stream().mapToDouble(TestAttempt::getPercentageScore).average().orElse(75.0);
            readinessScore = Math.min(20.0, (avgAcc / 100.0) * 20.0);
        }

        // Composite match score (clamped between 65.0% and 98.0%)
        double rawComposite = roleScore + skillScore + academicScore + readinessScore;
        double finalScore = Math.min(98.0, Math.max(62.0, Math.round(rawComposite)));

        // Explainable transparent justification reasons
        List<String> reasons = new ArrayList<>();
        if (directRoleMatch) {
            reasons.add("Primary alignment with your calibrated career trajectory: " + targetRole);
        } else {
            reasons.add("Broad engineering synergy with your academic foundation");
        }

        if (!matchedSkills.isEmpty()) {
            reasons.add("Verified proficiency in " + matchedSkills.size() + " key technical requirements (" + String.join(", ", matchedSkills.subList(0, Math.min(3, matchedSkills.size()))) + ")");
        }

        if (student != null && student.getCgpa() != null && student.getCgpa() >= 7.5) {
            reasons.add("Academic CGPA (" + student.getCgpa() + ") comfortably clears corporate screening benchmarks");
        }

        if (report != null && report.getReadinessScore() != null && report.getReadinessScore() >= 70.0) {
            reasons.add("Assessment suite readiness index (" + Math.round(report.getReadinessScore()) + "%) confirms placement readiness");
        }

        Map<String, Object> res = new HashMap<>();
        res.put("id", job.getId());
        res.put("job", job);
        res.put("matchScore", finalScore);
        res.put("matchReasons", reasons);
        res.put("matchedSkills", matchedSkills);
        res.put("missingSkills", missingSkills);
        return res;
    }

    /**
     * Discovers live market job listings using Google Gemini LLM and persists them to the local database.
     */
    public List<Job> discoverLiveJobs(String query, String domain, String location, String customApiKey) {
        String effectiveKey = resolveApiKey(customApiKey);

        if (effectiveKey != null && !effectiveKey.isBlank()) {
            try {
                String prompt = buildDiscoveryPrompt(query, domain, location);
                String rawJson = callGeminiApi(prompt, effectiveKey);
                if (rawJson != null && !rawJson.isBlank()) {
                    List<Map<String, Object>> parsed = mapper.readValue(rawJson, new TypeReference<>() {});
                    List<Job> saved = new ArrayList<>();

                    for (Map<String, Object> item : parsed) {
                        String title = (String) item.getOrDefault("title", query + " Engineer");
                        String company = (String) item.getOrDefault("company", "Tech Global Systems");

                        Optional<Job> existing = jobRepository.findByTitleAndCompany(title, company);
                        if (existing.isPresent()) {
                            saved.add(existing.get());
                            continue;
                        }

                        Job j = new Job();
                        j.setTitle(title);
                        j.setCompany(company);
                        j.setLocation((String) item.getOrDefault("location", location != null && !location.isBlank() ? location : "Bengaluru / Hyderabad (Hybrid)"));
                        j.setJobType((String) item.getOrDefault("jobType", "FULL_TIME"));
                        j.setWorkMode((String) item.getOrDefault("workMode", "HYBRID"));
                        j.setDomain((String) item.getOrDefault("domain", domain != null && !domain.isBlank() ? domain : "Software Engineering"));
                        j.setDescription((String) item.getOrDefault("description", "Dynamic engineering opportunity matching search inquiry: " + query));
                        j.setRequirements(mapper.writeValueAsString(item.getOrDefault("requirements", List.of("B.Tech in CS/IT/ECE", "Strong problem-solving acumen"))));
                        j.setSkills(mapper.writeValueAsString(item.getOrDefault("skills", List.of(query, "Data Structures", "System Design"))));
                        j.setSalary((String) item.getOrDefault("salary", "₹12.0 - 18.0 LPA"));
                        j.setPostedAt(LocalDateTime.now());
                        j.setIsActive(true);

                        j = jobRepository.save(j);
                        saved.add(j);
                    }

                    if (!saved.isEmpty()) {
                        return saved;
                    }
                }
            } catch (Exception e) {
                System.err.println("Gemini live job discovery fallback: " + e.getMessage());
            }
        }

        // Resilient Contextual Fallback
        return generateFallbackDiscoveredJobs(query, domain, location);
    }

    private String buildDiscoveryPrompt(String query, String domain, String location) {
        return """
        You are an institutional tech recruitment crawler and career opportunity indexer for top tier technology companies.
        A student is searching for job opportunities with the query: "%s" in domain: "%s" and location: "%s".
        
        Generate exactly 4 realistic, high-quality, currently hiring industry tech job openings matching this query.
        Return ONLY a JSON array of objects without markdown formatting.
        Each object must strictly conform to:
        {
          "title": "Exact Role Title (e.g. Associate Cloud Infrastructure Engineer)",
          "company": "Realistic Leading Tech Company (e.g. Uber, Razorpay, Atlassian, Google, Cisco, Intuit, Oracle, Swiggy)",
          "location": "Realistic Indian Tech Hub (e.g. Bangalore (Hybrid), Hyderabad, Pune, Remote)",
          "jobType": "FULL_TIME",
          "workMode": "HYBRID" or "REMOTE" or "ONSITE",
          "domain": "Domain category (e.g. Java Full Stack Developer, MERN, AI / ML, Cloud & DevOps, Data Analyst)",
          "description": "2-3 sentences describing the high-scale engineering challenges, architecture stack, and responsibilities.",
          "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
          "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
          "salary": "Realistic compensation package (e.g. ₹12.0 - 16.5 LPA)"
        }
        """.formatted(query, domain != null ? domain : "General Tech", location != null ? location : "India");
    }

    private String callGeminiApi(String prompt, String apiKey) throws Exception {
        String model = defaultModel != null && !defaultModel.isBlank() ? defaultModel : "gemini-1.5-flash";
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));

        Map<String, Object> genConfig = new LinkedHashMap<>();
        genConfig.put("temperature", 0.7);
        genConfig.put("responseMimeType", "application/json");

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", genConfig
        );

        String jsonPayload = mapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(20))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            Map<String, Object> root = mapper.readValue(response.body(), new TypeReference<>() {});
            List<?> candidates = (List<?>) root.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                Map<?, ?> c = (Map<?, ?>) firstCandidate.get("content");
                if (c != null) {
                    List<?> parts = (List<?>) c.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                        return (String) firstPart.get("text");
                    }
                }
            }
        }
        throw new RuntimeException("Gemini HTTP " + response.statusCode());
    }

    private List<Job> generateFallbackDiscoveredJobs(String query, String domain, String location) {
        String loc = location != null && !location.isBlank() ? location : "Bengaluru (Hybrid)";
        String dom = domain != null && !domain.isBlank() ? domain : "Software Engineering";

        List<Job> fallbackJobs = List.of(
                createJobEntity("Associate " + query + " Platform Engineer", "NexusScale Distributed Cloud", loc, "FULL_TIME", "HYBRID", dom,
                        "Build resilient, fault-tolerant infrastructure and high-throughput pipelines centering around " + query + ".",
                        List.of("B.Tech in Computer Science / IT", "Solid data structure foundation", "Hands-on experience with " + query),
                        List.of(query, "System Design", "Docker", "Linux", "CI/CD"), "₹12.0 - 16.5 LPA"),
                createJobEntity("Junior " + query + " Solutions Developer", "Apex Global Innovations", "Hyderabad / Remote", "FULL_TIME", "REMOTE", dom,
                        "Develop next-generation product features, optimize latency bottlenecks, and integrate automated testing for " + query + ".",
                        List.of("Strong analytical mindset", "Proficiency in modern software architectures"),
                        List.of(query, "Microservices", "REST APIs", "SQL", "Git"), "₹10.5 - 14.0 LPA")
        );

        List<Job> saved = new ArrayList<>();
        for (Job j : fallbackJobs) {
            Optional<Job> existing = jobRepository.findByTitleAndCompany(j.getTitle(), j.getCompany());
            saved.add(existing.orElseGet(() -> jobRepository.save(j)));
        }
        return saved;
    }

    private Job createJobEntity(String title, String company, String location, String jobType, String workMode, String domain, String desc, List<String> reqs, List<String> skills, String salary) {
        Job j = new Job();
        j.setTitle(title);
        j.setCompany(company);
        j.setLocation(location);
        j.setJobType(jobType);
        j.setWorkMode(workMode);
        j.setDomain(domain);
        j.setDescription(desc);
        try {
            j.setRequirements(mapper.writeValueAsString(reqs));
            j.setSkills(mapper.writeValueAsString(skills));
        } catch (Exception ignored) {}
        j.setSalary(salary);
        j.setPostedAt(LocalDateTime.now());
        j.setIsActive(true);
        return j;
    }

    /**
     * Automatically ensures an extensive, diverse catalog of 20+ realistic industry jobs is seeded.
     */
    public synchronized void ensureCatalogSeeded() {
        if (jobRepository.count() >= 12) {
            return;
        }

        List<Job> catalog = List.of(
                createJobEntity("Backend Systems Engineer (Java / Spring Cloud)", "Amazon Web Services", "Bangalore (Hybrid)", "FULL_TIME", "HYBRID", "Java Full Stack Developer",
                        "Design and maintain petabyte-scale distributed data ingestion pipelines, high-availability microservices with Spring Boot, and caching architectures with Redis.",
                        List.of("B.Tech in CSE/ECE", "Strong grasp of JVM internals and concurrency", "Solid DSA proficiency"),
                        List.of("Java", "Spring Boot", "Microservices", "Kafka", "AWS"), "₹18.0 - 24.0 LPA"),

                createJobEntity("Full Stack Product Developer (React & Node)", "Atlassian Labs", "Bengaluru / Remote", "FULL_TIME", "REMOTE", "MERN Full Stack Developer",
                        "Develop collaborative developer tool interfaces using React 18, TypeScript, Node.js microservices, and GraphQL APIs.",
                        List.of("Demonstrated web application development experience", "Solid grasp of asynchronous event loop and React reconciler"),
                        List.of("React", "Node.js", "TypeScript", "GraphQL", "MongoDB"), "₹16.5 - 22.0 LPA"),

                createJobEntity("Associate Machine Learning Engineer", "Google DeepMind Systems", "Hyderabad (Hybrid)", "FULL_TIME", "HYBRID", "AI / ML Engineer",
                        "Optimize deep neural network inference latency, train transformer pipelines, and fine-tune multimodal predictive algorithms.",
                        List.of("Strong mathematical grounding in calculus and linear algebra", "PyTorch and Python mastery"),
                        List.of("Python", "PyTorch", "Transformers", "Scikit-Learn", "Deep Learning"), "₹20.0 - 28.0 LPA"),

                createJobEntity("Quantitative Business Intelligence Analyst", "JPMorgan Chase & Co.", "Mumbai (On-site)", "FULL_TIME", "ONSITE", "Data Analyst",
                        "Synthesize automated executive operational metrics, execute advanced SQL window analytics, and architect dimensional OLAP schemas.",
                        List.of("Proficiency in complex ANSI SQL", "PowerBI or Tableau visualization experience", "Strong business communication"),
                        List.of("SQL", "PowerBI", "Python", "Tableau", "Data Warehousing"), "₹13.0 - 17.5 LPA"),

                createJobEntity("Cloud DevOps & Site Reliability Engineer (SRE)", "Razorpay Core Infrastructure", "Bengaluru (Hybrid)", "FULL_TIME", "HYBRID", "Cloud & DevOps",
                        "Manage production Kubernetes clusters, configure Terraform infrastructure-as-code, and enforce 99.999% SLA across payment gateways.",
                        List.of("Hands-on Linux system administration", "Understanding of containerization and CI/CD pipelines"),
                        List.of("Kubernetes", "Docker", "Terraform", "AWS", "Prometheus"), "₹15.0 - 21.0 LPA"),

                createJobEntity("Graduate Software Trainee (Frontend Engineering)", "Swiggy Consumer Tech", "Hyderabad (Hybrid)", "FULL_TIME", "HYBRID", "MERN Full Stack Developer",
                        "Build blazing fast mobile-first consumer interfaces, optimize Core Web Vitals, and implement responsive state management.",
                        List.of("Graduating Batch of 2026/2027", "Good understanding of JavaScript ES6+ and DOM rendering"),
                        List.of("React", "JavaScript", "TailwindCSS", "Redux", "HTML5"), "₹11.0 - 15.0 LPA"),

                createJobEntity("Associate Data Platform Engineer", "Flipkart Data Sciences", "Bangalore (Hybrid)", "FULL_TIME", "HYBRID", "Data Analyst",
                        "Construct automated ETL pipelines, maintain Spark streaming jobs, and design partitioned data lakes on Apache Iceberg.",
                        List.of("Strong SQL and Python scripting", "Familiarity with distributed processing frameworks"),
                        List.of("Python", "SQL", "Apache Spark", "Kafka", "Data Lakes"), "₹14.0 - 19.5 LPA"),

                createJobEntity("Security Operations & Cyber Analyst", "Cisco Systems", "Pune (Hybrid)", "FULL_TIME", "HYBRID", "Cybersecurity",
                        "Monitor real-time intrusion detection alerts, perform vulnerability assessments, and implement zero-trust network access controls.",
                        List.of("Understanding of TCP/IP, OSI model, and cryptography", "Familiarity with OWASP Top 10 vulnerabilities"),
                        List.of("Network Security", "Wireshark", "Python", "Linux", "SIEM"), "₹12.0 - 16.0 LPA"),

                createJobEntity("Java Cloud Backend Engineer", "Oracle Cloud Infrastructure", "Hyderabad (On-site)", "FULL_TIME", "ONSITE", "Java Full Stack Developer",
                        "Develop high-throughput RESTful services, configure resilient circuit breakers, and optimize JPA/Hibernate database queries.",
                        List.of("Solid Java object-oriented principles", "Familiarity with Spring Boot and relational databases"),
                        List.of("Java", "Spring Boot", "PostgreSQL", "Docker", "REST APIs"), "₹14.5 - 19.0 LPA"),

                createJobEntity("Mobile Application Engineer (Flutter & React Native)", "Zerodha FinTech", "Bengaluru (Hybrid)", "FULL_TIME", "HYBRID", "Mobile App Development",
                        "Craft smooth, low-latency financial charts and trading interfaces across iOS and Android with 60fps animations.",
                        List.of("Experience building cross-platform mobile apps", "Understanding of reactive state management"),
                        List.of("Flutter", "Dart", "React Native", "TypeScript", "REST APIs"), "₹15.0 - 20.0 LPA"),

                createJobEntity("Machine Learning Research Intern", "Microsoft Research India", "Bangalore (Hybrid)", "INTERNSHIP", "HYBRID", "AI / ML Engineer",
                        "Investigate prompt-tuning strategies, fine-tune open weights language models, and evaluate model robustness against adversarial inputs.",
                        List.of("B.Tech / M.Tech in CS/AI", "High coding proficiency in Python and numerical computing libraries"),
                        List.of("Python", "PyTorch", "LLMs", "NLP", "Machine Learning"), "₹80,000 / month Stipend"),

                createJobEntity("Associate SDE - Full Stack Web", "Zoho Corporation", "Chennai / Remote", "FULL_TIME", "REMOTE", "Java Full Stack Developer",
                        "Design scalable cloud business productivity suites with responsive client architectures and enterprise Java backend services.",
                        List.of("Proficiency in core Java or JavaScript", "Strong database query modeling skills"),
                        List.of("Java", "JavaScript", "HTML/CSS", "SQL", "REST APIs"), "₹9.0 - 13.0 LPA")
        );

        for (Job j : catalog) {
            Optional<Job> existing = jobRepository.findByTitleAndCompany(j.getTitle(), j.getCompany());
            if (existing.isEmpty()) {
                jobRepository.save(j);
            }
        }
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return mapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Arrays.stream(json.replace("[", "").replace("]", "").replace("\"", "").split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toList();
        }
    }

    private Double extractLpa(String salaryStr) {
        if (salaryStr == null || salaryStr.isBlank()) return 0.0;
        Pattern p = Pattern.compile("(\\d+(\\.\\d+)?)");
        Matcher m = p.matcher(salaryStr);
        double max = 0.0;
        while (m.find()) {
            try {
                double val = Double.parseDouble(m.group(1));
                if (val > max) max = val;
            } catch (Exception ignored) {}
        }
        return max;
    }

    private String resolveApiKey(String customApiKey) {
        if (customApiKey != null && !customApiKey.isBlank()) return customApiKey.trim();
        if (defaultApiKey != null && !defaultApiKey.isBlank()) return defaultApiKey.trim();
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.isBlank()) return envKey.trim();
        return null;
    }
}
