package com.placement.system.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.system.model.*;
import com.placement.system.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.*;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            StudentRepository studentRepository,
            CareerGoalRepository careerGoalRepository,
            PlacementOfficerRepository placementOfficerRepository,
            CompanyRepository companyRepository,
            TestCategoryRepository testCategoryRepository,
            QuestionRepository questionRepository,
            JobRepository jobRepository,
            PlacementDriveRepository placementDriveRepository,
            PlacementApplicationRepository placementApplicationRepository
    ) {
        return args -> {
            ObjectMapper mapper = new ObjectMapper();

            // 1. Admin
            if (!userRepository.existsByEmail("admin@system.com")) {
                User admin = userRepository.save(new User("admin@system.com", "Admin@123", "ADMIN"));
            }

            // 2. Placement Officer
            PlacementOfficer officer = null;
            if (!userRepository.existsByEmail("officer@college.edu")) {
                User officerUser = userRepository.save(new User("officer@college.edu", "Officer@123", "PLACEMENT_OFFICER"));
                officer = new PlacementOfficer();
                officer.setUserId(officerUser.getId());
                officer.setName("Prof. Ramesh K. Sharma");
                officer.setDepartment("Corporate Training & Placement Cell");
                officer.setEmployeeId("TPO-2024-01");
                officer.setPhone("+91 98450 12345");
                officer = placementOfficerRepository.save(officer);
            } else {
                officer = placementOfficerRepository.findAll().stream().findFirst().orElse(null);
            }

            // 3. Corporate Partner
            Company company = null;
            if (!userRepository.existsByEmail("hr@techcorp.com")) {
                User companyUser = userRepository.save(new User("hr@techcorp.com", "Company@123", "COMPANY"));
                company = new Company();
                company.setUserId(companyUser.getId());
                company.setCompanyName("TechCorp Digital Solutions");
                company.setIndustry("Enterprise Cloud & AI Products");
                company.setWebsite("https://techcorp-sample.com");
                company.setContactPerson("Ananya Deshmukh (Lead Recruiter)");
                company.setContactEmail("hr@techcorp.com");
                company.setIsVerified(true);
                company = companyRepository.save(company);
            } else {
                company = companyRepository.findAll().stream().findFirst().orElse(null);
            }

            // 4. Students
            Student arjun = null;
            if (!userRepository.existsByEmail("arjun@student.edu")) {
                User arjunUser = userRepository.save(new User("arjun@student.edu", "Student@123", "STUDENT"));
                arjun = new Student();
                arjun.setUserId(arjunUser.getId());
                arjun.setName("Arjun Sharma");
                arjun.setDepartment("Computer Science");
                arjun.setSemester(8);
                arjun.setCgpa(8.45);
                arjun.setGraduationYear(2025);
                arjun.setBacklogs(0);
                arjun.setPhone("+91 91234 56780");
                arjun.setSkills(mapper.writeValueAsString(List.of("Python", "Data Structures", "React", "SQL", "FastAPI", "Docker")));
                arjun.setInterests(mapper.writeValueAsString(List.of("Full-Stack Development", "AI/ML Engineering", "Distributed Systems")));
                arjun = studentRepository.save(arjun);

                CareerGoal goal = new CareerGoal();
                goal.setStudentId(arjun.getId());
                goal.setTargetRole("Software Developer");
                goal.setTargetDomain("Cloud & Systems");
                goal.setTargetIndustry("Technology");
                careerGoalRepository.save(goal);
            } else {
                arjun = studentRepository.findAll().stream().findFirst().orElse(null);
            }

            if (!userRepository.existsByEmail("priya@student.edu")) {
                User priyaUser = userRepository.save(new User("priya@student.edu", "Student@123", "STUDENT"));
                Student priya = new Student();
                priya.setUserId(priyaUser.getId());
                priya.setName("Priya Patel");
                priya.setDepartment("Information Technology");
                priya.setSemester(8);
                priya.setCgpa(7.90);
                priya.setGraduationYear(2025);
                priya.setBacklogs(0);
                priya.setPhone("+91 91234 56781");
                priya.setSkills(mapper.writeValueAsString(List.of("JavaScript", "Node.js", "Express", "MongoDB", "TailwindCSS")));
                priya.setInterests(mapper.writeValueAsString(List.of("Full Stack Web", "Cloud Infrastructure")));
                priya = studentRepository.save(priya);

                CareerGoal goal = new CareerGoal();
                goal.setStudentId(priya.getId());
                goal.setTargetRole("Full Stack Developer");
                goal.setTargetDomain("Web Applications");
                goal.setTargetIndustry("SaaS Platforms");
                careerGoalRepository.save(goal);
            }

            // 5. Test Categories & Questions
            Map<String, String> catMap = new HashMap<>();
            List<TestCategory> categories = List.of(
                new TestCategory("Quantitative Aptitude", "COMMON", "Foundational Aptitude", "Numerical agility, speed-distance-time, probability, ratios."),
                new TestCategory("Logical Reasoning", "COMMON", "Foundational Reasoning", "Deductive logic, syllogisms, sequence patterns, and relations."),
                new TestCategory("Verbal Ability", "COMMON", "Foundational English", "Sentence structure, grammar precision, and critical reading."),
                new TestCategory("Data Structures & Algorithms", "TECHNICAL", "Computer Science", "Complexity bounds, trees, graphs, sorting, searching, DP."),
                new TestCategory("DBMS", "TECHNICAL", "Computer Science", "SQL joins, ACID guarantees, 3NF normalization, and indexing."),
                new TestCategory("OOP Concepts", "TECHNICAL", "Computer Science", "SOLID principles, encapsulation, polymorphism, design patterns."),
                new TestCategory("Operating Systems", "TECHNICAL", "Computer Science", "Processes, virtual memory, threads, synchronization, deadlocks."),
                new TestCategory("Computer Networks", "TECHNICAL", "Computer Science", "TCP/IP models, routing protocols, sockets, and security."),
                new TestCategory("Java & Spring Boot", "TECHNICAL", "Java Full Stack", "Core Java, JVM memory, Spring Boot REST APIs, JPA/Hibernate, Microservices."),
                new TestCategory("Web Frontend & React", "TECHNICAL", "Full Stack Web", "React hooks, state management, component lifecycles, Virtual DOM, CSS/Tailwind."),
                new TestCategory("Node.js & Backend Architecture", "TECHNICAL", "MERN Stack", "Express routing, asynchronous event loops, MongoDB/Mongoose, JWT security."),
                new TestCategory("Machine Learning & Python", "TECHNICAL", "AI / Data Science", "Supervised/unsupervised models, scikit-learn, neural networks, loss functions."),
                new TestCategory("Data Analytics & BI (SQL/Tableau)", "TECHNICAL", "Analytics", "Complex SQL window functions, aggregation, ETL pipelines, BI metrics.")
            );

            for (TestCategory c : categories) {
                TestCategory saved = testCategoryRepository.findByName(c.getName())
                        .orElseGet(() -> testCategoryRepository.save(c));
                catMap.put(saved.getName(), saved.getId());
            }

            // Seed sample questions
            addQuestionIfMissing(questionRepository, catMap.get("Data Structures & Algorithms"),
                    "What is the tightest worst-case time complexity of finding an element in a Balanced Binary Search Tree with N nodes?",
                    mapper.writeValueAsString(List.of("O(1)", "O(log N)", "O(N)", "O(N log N)")),
                    "O(log N)", "MEDIUM", "Trees", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Data Structures & Algorithms"),
                    "Which data structure is intrinsically used to perform a Breadth-First Search (BFS) on an unweighted graph?",
                    mapper.writeValueAsString(List.of("Stack", "Queue", "Priority Queue", "Min-Heap")),
                    "Queue", "EASY", "Graphs", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("DBMS"),
                    "Which database normalization form explicitly eliminates transitive functional dependencies for non-prime attributes?",
                    mapper.writeValueAsString(List.of("First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "BCNF")),
                    "Third Normal Form (3NF)", "MEDIUM", "Normalization", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("DBMS"),
                    "In transactional database processing, what does the 'I' in ACID guarantees represent?",
                    mapper.writeValueAsString(List.of("Integrity", "Isolation", "Indexing", "Idempotency")),
                    "Isolation", "EASY", "Transactions", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("OOP Concepts"),
                    "Which SOLID principle mandates that high-level modules should not depend on low-level modules, but rather abstractions?",
                    mapper.writeValueAsString(List.of("Single Responsibility Principle", "Open/Closed Principle", "Liskov Substitution Principle", "Dependency Inversion Principle")),
                    "Dependency Inversion Principle", "MEDIUM", "SOLID Principles", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Quantitative Aptitude"),
                    "A train 180 meters long travelling at 72 km/h crosses an electric pole in how many seconds?",
                    mapper.writeValueAsString(List.of("6 seconds", "9 seconds", "12 seconds", "15 seconds")),
                    "9 seconds", "MEDIUM", "Speed & Distance", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Logical Reasoning"),
                    "Identify the missing number in the numerical progression: 7, 14, 28, 56, ?",
                    mapper.writeValueAsString(List.of("84", "96", "112", "124")),
                    "112", "EASY", "Number Series", 1, 0.25);

            // Seed Role-Specific Track Questions
            addQuestionIfMissing(questionRepository, catMap.get("Java & Spring Boot"),
                    "In Spring Boot, which annotation is primarily used to inject bean dependencies automatically into fields or constructors?",
                    mapper.writeValueAsString(List.of("@Autowired", "@Injectable", "@ComponentBinding", "@ResourceRef")),
                    "@Autowired", "EASY", "Spring IoC & DI", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Java & Spring Boot"),
                    "What is the key functional difference between JVM and JRE in the Java ecosystem?",
                    mapper.writeValueAsString(List.of("JVM executes bytecode; JRE provides the execution environment and standard class libraries", "JRE compiles source code; JVM converts to binary", "JVM is only used on Windows; JRE is cross-platform", "There is no difference")),
                    "JVM executes bytecode; JRE provides the execution environment and standard class libraries", "MEDIUM", "Java Internals", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Web Frontend & React"),
                    "In React 18, which React hook should be utilized to perform side effects such as data subscriptions or manual DOM modifications?",
                    mapper.writeValueAsString(List.of("useState", "useEffect", "useMemo", "useContext")),
                    "useEffect", "EASY", "React Hooks", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Web Frontend & React"),
                    "What is the fundamental architectural benefit of the React Virtual DOM during state changes?",
                    mapper.writeValueAsString(List.of("Diffs changes in-memory and minimizes expensive real-DOM re-paint operations", "Directly binds to GPU hardware acceleration", "Eliminates JavaScript runtime overhead", "Stores component state permanently in local storage")),
                    "Diffs changes in-memory and minimizes expensive real-DOM re-paint operations", "MEDIUM", "Virtual DOM Reconciliation", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Node.js & Backend Architecture"),
                    "How does Node.js successfully handle thousands of concurrent client requests despite its single-threaded JavaScript execution model?",
                    mapper.writeValueAsString(List.of("Through an asynchronous, non-blocking Event Loop powered by libuv", "By spawning native OS threads for every incoming TCP socket", "By utilizing synchronous thread sleep routines", "Through multi-core CPU time slicing")),
                    "Through an asynchronous, non-blocking Event Loop powered by libuv", "MEDIUM", "Node.js Event Loop", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Machine Learning & Python"),
                    "Which classical machine learning algorithm finds the optimal decision hyperplane that maximizes the geometric margin between data classes?",
                    mapper.writeValueAsString(List.of("Support Vector Machines (SVM)", "K-Means Clustering", "Naive Bayes Classifier", "Linear Regression")),
                    "Support Vector Machines (SVM)", "MEDIUM", "Classification Algorithms", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Machine Learning & Python"),
                    "In deep neural network training, which activation function mitigates the vanishing gradient problem commonly found in Sigmoid units?",
                    mapper.writeValueAsString(List.of("Rectified Linear Unit (ReLU)", "Hyperbolic Tangent (Tanh)", "Softmax", "Binary Step Function")),
                    "Rectified Linear Unit (ReLU)", "MEDIUM", "Neural Activation Functions", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Data Analytics & BI (SQL/Tableau)"),
                    "Which ANSI SQL window function assigns a contiguous sequential integer to each row within a window partition starting at 1?",
                    mapper.writeValueAsString(List.of("ROW_NUMBER()", "DENSE_RANK()", "LEAD()", "PARTITION_INDEX()")),
                    "ROW_NUMBER()", "EASY", "SQL Analytical Window Functions", 1, 0.25);

            addQuestionIfMissing(questionRepository, catMap.get("Data Analytics & BI (SQL/Tableau)"),
                    "In business intelligence enterprise data modeling, what architectural pattern connects a central fact table directly to surrounding dimension tables?",
                    mapper.writeValueAsString(List.of("Star Schema", "Snowflake Schema (Normalized)", "Galaxy Constellation", "Relational 3NF")),
                    "Star Schema", "MEDIUM", "Dimensional Data Modeling", 1, 0.25);

            // 6. External Jobs
            if (jobRepository.count() == 0) {
                Job j1 = new Job();
                j1.setTitle("Associate Software Engineer (Backend)");
                j1.setCompany("CloudScale Technologies");
                j1.setLocation("Bangalore (Hybrid)");
                j1.setJobType("FULL_TIME");
                j1.setDescription("Responsible for architecting RESTful services, high-throughput microservices, and database query optimizations using Spring Boot/Node.js and PostgreSQL.");
                j1.setRequirements(mapper.writeValueAsString(List.of("B.Tech in CS/IT/ECE", "CGPA >= 7.5", "Solid grasp of DSA & Databases")));
                j1.setSkills(mapper.writeValueAsString(List.of("Java", "Spring Boot", "Data Structures", "SQL", "Docker")));
                j1.setSalary("₹8.5 - 12.0 LPA");
                jobRepository.save(j1);

                Job j2 = new Job();
                j2.setTitle("Full Stack Product Engineer");
                j2.setCompany("NextGen Fintech Labs");
                j2.setLocation("Hyderabad / Pune");
                j2.setJobType("FULL_TIME");
                j2.setDescription("Build enterprise-grade financial workflow dashboards using React, TypeScript, Java/Node.js, and event-driven architectures.");
                j2.setRequirements(mapper.writeValueAsString(List.of("Graduating Class of 2025", "Strong portfolio projects", "Good communication")));
                j2.setSkills(mapper.writeValueAsString(List.of("React", "JavaScript", "Java", "Spring Boot", "TailwindCSS")));
                j2.setSalary("₹10.0 - 14.5 LPA");
                jobRepository.save(j2);
            }

            // 7. Campus Drives
            if (placementDriveRepository.count() == 0 && officer != null) {
                PlacementDrive d1 = new PlacementDrive();
                d1.setOfficerId(officer.getId());
                if (company != null) d1.setCompanyId(company.getId());
                d1.setTitle("TechCorp 2025 Annual Campus Recruitment Drive");
                d1.setJobRole("Software Development Engineer - I (SDE-1)");
                d1.setCtc("₹11.2 LPA Fixed + Performance Bonus");
                d1.setWorkMode("HYBRID");
                d1.setLocation("Bangalore / Pune / Hyderabad");
                d1.setJobDescription("TechCorp is conducting campus recruitment for talented 2025 batch graduates. Candidates will work across cloud architectures, backend microservices, and distributed data systems.");
                d1.setDeadline(LocalDateTime.now().plusDays(45));
                d1.setStatus("PUBLISHED");

                Map<String, Object> criteria = new HashMap<>();
                criteria.put("minCgpa", 7.5);
                criteria.put("maxBacklogs", 0);
                criteria.put("departments", List.of("Computer Science", "Information Technology"));
                d1.setEligibilityCriteria(mapper.writeValueAsString(criteria));
                PlacementDrive savedDrive = placementDriveRepository.save(d1);

                // Add sample application
                if (arjun != null) {
                    PlacementApplication app = new PlacementApplication(arjun.getId(), savedDrive.getId());
                    app.setStatus("ASSESSMENT_COMPLETED");
                    placementApplicationRepository.save(app);
                }
            }

            System.out.println("✅ Spring Boot Placement Readiness Database Initialized Successfully!");
        };
    }

    private void addQuestionIfMissing(QuestionRepository repo, String catId, String text, String options, String ans, String diff, String topic, int marks, double neg) {
        if (catId == null) return;
        if (repo.findByTestCategoryIdAndQuestionText(catId, text).isEmpty()) {
            Question q = new Question();
            q.setTestCategoryId(catId);
            q.setQuestionText(text);
            q.setOptions(options);
            q.setCorrectAnswer(ans);
            q.setDifficulty(diff);
            q.setTopic(topic);
            q.setMarks(marks);
            q.setNegativeMarks(neg);
            repo.save(q);
        }
    }
}
