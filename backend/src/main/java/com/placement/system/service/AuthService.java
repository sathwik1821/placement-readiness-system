package com.placement.system.service;

import com.placement.system.dto.LoginRequestDto;
import com.placement.system.dto.LoginResponseDto;
import com.placement.system.dto.PasswordResetDto;
import com.placement.system.dto.StudentRegisterDto;
import com.placement.system.model.Company;
import com.placement.system.model.PlacementOfficer;
import com.placement.system.model.Student;
import com.placement.system.model.User;
import com.placement.system.repository.CompanyRepository;
import com.placement.system.repository.PlacementOfficerRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PlacementOfficerRepository officerRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Authenticates a user and returns a signed JWT token along with role details.
     * Supports both BCrypt hashes and legacy passwords with automatic migration to BCrypt.
     */
    public LoginResponseDto login(LoginRequestDto req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password credentials"));

        if (!matchesPassword(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password credentials");
        }

        // Automatic security upgrade: If user password is plain text, re-hash with BCrypt
        if (!isBcryptHash(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
            userRepository.save(user);
            logger.info("Migrated legacy password to BCrypt hash for user: {}", cleanEmail);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new LoginResponseDto(token, user.getRole(), user.getEmail(), user.getId());
    }

    /**
     * Registers a new RGUKT student account with validated institutional data.
     */
    public Map<String, Object> registerStudent(StudentRegisterDto req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalStateException("An account with this RGUKT email is already registered");
        }

        if (req.getConfirmPassword() != null && !req.getConfirmPassword().equals(req.getPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Create User entity with BCrypt encoded password
        String hashedPassword = passwordEncoder.encode(req.getPassword());
        User user = new User(cleanEmail, hashedPassword, "STUDENT");
        user = userRepository.save(user);

        // Create Student entity
        Student student = new Student();
        student.setUserId(user.getId());
        student.setEmail(cleanEmail);
        student.setName(req.getName() != null ? req.getName().trim() : "Student");
        student.setRollNumber(req.getRollNumber() != null ? req.getRollNumber().trim() : "");
        student.setDepartment(req.getDepartment() != null ? req.getDepartment().trim() : "Computer Science & Engineering");
        student.setGraduationYear(req.getGraduationYear() != null ? req.getGraduationYear() : 2027);
        student.setCollege(req.getCollege() != null ? req.getCollege().trim() : "RGUKT Srikakulam");
        student.setBatch(student.getGraduationYear() + " Graduating Batch • B.Tech");
        studentRepository.save(student);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("student", student);
        return response;
    }

    /**
     * Registers a placement officer account.
     */
    public Map<String, Object> registerOfficer(String email, String password, String name, String department) {
        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalStateException("An account with this email is already registered");
        }

        User user = new User(cleanEmail, passwordEncoder.encode(password), "PLACEMENT_OFFICER");
        user = userRepository.save(user);

        PlacementOfficer officer = new PlacementOfficer();
        officer.setUserId(user.getId());
        officer.setName(name);
        officer.setDepartment(department != null ? department : "Corporate Training & Placement Cell");
        officerRepository.save(officer);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return Map.of("token", token, "role", user.getRole(), "name", officer.getName());
    }

    /**
     * Registers a recruiting company partner.
     */
    public Map<String, Object> registerCompany(String email, String password, String companyName, String contactPerson) {
        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalStateException("An account with this email is already registered");
        }

        User user = new User(cleanEmail, passwordEncoder.encode(password), "COMPANY");
        user = userRepository.save(user);

        Company company = new Company();
        company.setUserId(user.getId());
        company.setCompanyName(companyName);
        company.setContactPerson(contactPerson);
        company.setContactEmail(cleanEmail);
        companyRepository.save(company);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return Map.of("token", token, "role", user.getRole(), "companyName", company.getCompanyName());
    }

    /**
     * Resets a user password using verified OTP.
     */
    public boolean resetPassword(PasswordResetDto req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();

        boolean isOtpValid = emailService.verifyOtp(cleanEmail, req.getOtp().trim());
        if (!isOtpValid) {
            throw new IllegalArgumentException("Invalid or expired verification OTP");
        }

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("User account not found"));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        return true;
    }

    /**
     * Fetches current profile payload based on role.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());

        switch (user.getRole()) {
            case "STUDENT" -> studentRepository.findByUserId(userId).ifPresent(s -> profile.put("student", s));
            case "PLACEMENT_OFFICER" -> officerRepository.findByUserId(userId).ifPresent(o -> profile.put("officer", o));
            case "COMPANY" -> companyRepository.findByUserId(userId).ifPresent(c -> profile.put("company", c));
        }

        return profile;
    }

    private boolean matchesPassword(String rawPassword, String storedPassword) {
        if (rawPassword == null || storedPassword == null) return false;
        if (isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return rawPassword.equals(storedPassword);
    }

    private boolean isBcryptHash(String password) {
        return password != null && (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }
}
