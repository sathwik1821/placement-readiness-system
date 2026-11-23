package com.placement.system.service;

import com.placement.system.dto.LoginRequestDto;
import com.placement.system.dto.LoginResponseDto;
import com.placement.system.dto.StudentRegisterDto;
import com.placement.system.model.Student;
import com.placement.system.model.User;
import com.placement.system.repository.StudentRepository;
import com.placement.system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("s210018@rguktsklm.ac.in", "$2a$10$hashedPasswordSample", "STUDENT");
        sampleUser.setId("user-123");
    }

    @Test
    @DisplayName("Should successfully authenticate user with valid credentials and return JWT token")
    void login_WithValidCredentials_ReturnsLoginResponse() {
        when(userRepository.findByEmail("s210018@rguktsklm.ac.in")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Student@123", sampleUser.getPassword())).thenReturn(true);
        when(jwtService.generateToken("user-123", "s210018@rguktsklm.ac.in", "STUDENT")).thenReturn("mock-jwt-token");

        LoginRequestDto req = new LoginRequestDto("s210018@rguktsklm.ac.in", "Student@123");
        LoginResponseDto res = authService.login(req);

        assertNotNull(res);
        assertEquals("mock-jwt-token", res.getToken());
        assertEquals("STUDENT", res.getRole());
        assertEquals("s210018@rguktsklm.ac.in", res.getEmail());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when password does not match")
    void login_WithInvalidPassword_ThrowsException() {
        when(userRepository.findByEmail("s210018@rguktsklm.ac.in")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", sampleUser.getPassword())).thenReturn(false);

        LoginRequestDto req = new LoginRequestDto("s210018@rguktsklm.ac.in", "WrongPassword");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.login(req));
        assertEquals("Invalid email or password credentials", ex.getMessage());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when email is not found")
    void login_WithNonExistentEmail_ThrowsException() {
        when(userRepository.findByEmail("unknown@rgukt.ac.in")).thenReturn(Optional.empty());

        LoginRequestDto req = new LoginRequestDto("unknown@rgukt.ac.in", "Password@123");

        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Should successfully register a new student and encode password with BCrypt")
    void registerStudent_WithUniqueEmail_SavesUserAndStudent() {
        StudentRegisterDto dto = new StudentRegisterDto();
        dto.setEmail("newstudent@rguktsklm.ac.in");
        dto.setPassword("Secret@123");
        dto.setConfirmPassword("Secret@123");
        dto.setName("New Student");
        dto.setRollNumber("S220999");
        dto.setDepartment("Computer Science & Engineering");

        when(userRepository.existsByEmail("newstudent@rguktsklm.ac.in")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("$2a$10$encodedNewPassword");

        User savedUser = new User("newstudent@rguktsklm.ac.in", "$2a$10$encodedNewPassword", "STUDENT");
        savedUser.setId("user-new-456");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken("user-new-456", "newstudent@rguktsklm.ac.in", "STUDENT")).thenReturn("new-jwt-token");

        Map<String, Object> result = authService.registerStudent(dto);

        assertNotNull(result);
        assertEquals("new-jwt-token", result.get("token"));
        assertEquals("STUDENT", result.get("role"));
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Should throw IllegalStateException if student email is already registered")
    void registerStudent_WithExistingEmail_ThrowsException() {
        StudentRegisterDto dto = new StudentRegisterDto();
        dto.setEmail("s210018@rguktsklm.ac.in");
        dto.setPassword("Secret@123");

        when(userRepository.existsByEmail("s210018@rguktsklm.ac.in")).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> authService.registerStudent(dto));
        verify(userRepository, never()).save(any());
        verify(studentRepository, never()).save(any());
    }
}
