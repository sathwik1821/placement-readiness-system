package com.placement.system.controller;

import com.placement.system.model.CareerGoal;
import com.placement.system.model.Student;
import com.placement.system.model.User;
import com.placement.system.repository.CareerGoalRepository;
import com.placement.system.repository.StudentRepository;
import com.placement.system.repository.UserRepository;
import com.placement.system.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password credentials"));
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of("token", token, "role", user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String role = (String) payload.get("role");
        String name = (String) payload.get("name");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered in system"));
        }

        User user = userRepository.save(new User(email, password, role));

        if ("STUDENT".equals(role)) {
            Student student = new Student();
            student.setUserId(user.getId());
            student.setName(name != null ? name : email.split("@")[0]);
            student.setDepartment("Computer Science");
            student = studentRepository.save(student);

            CareerGoal goal = new CareerGoal();
            goal.setStudentId(student.getId());
            careerGoalRepository.save(goal);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of("token", token, "role", user.getRole()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtService.extractUserId(token);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("createdAt", user.getCreatedAt());

        if ("STUDENT".equals(user.getRole())) {
            studentRepository.findByUserId(user.getId()).ifPresent(s -> {
                response.put("student", s);
                careerGoalRepository.findByStudentId(s.getId()).ifPresent(g -> response.put("careerGoal", g));
            });
        }

        return ResponseEntity.ok(response);
    }
}
