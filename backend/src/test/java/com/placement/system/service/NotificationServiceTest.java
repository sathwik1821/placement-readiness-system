package com.placement.system.service;

import com.placement.system.model.NotificationLog;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.Student;
import com.placement.system.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private EmailService emailService;

    @Mock
    private EmailTemplateService emailTemplateService;

    @Mock
    private NotificationLogRepository notificationLogRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PlacementOfficerRepository officerRepository;

    @Mock
    private PlacementDriveRepository driveRepository;

    @Mock
    private PlacementApplicationRepository applicationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Student student;
    private PlacementDrive drive;
    private PlacementApplication app;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId("st-1");
        student.setName("Priya Patel");
        student.setEmail("s220145@rguktsklm.ac.in");

        drive = new PlacementDrive();
        drive.setId("dr-1");
        drive.setTitle("Amazon AWS");
        drive.setJobRole("Cloud DevOps Engineer");
        drive.setStatus("PUBLISHED");

        app = new PlacementApplication("st-1", "dr-1");
        app.setId("app-777");
    }

    @Test
    @DisplayName("Should build confirmation template and trigger async email when application is submitted")
    void notifyApplicationSubmitted_DispatchesEmail() {
        when(emailTemplateService.buildStudentApplicationConfirmation(eq(student), eq(drive), eq(app)))
                .thenReturn("<html>Confirmation</html>");

        notificationService.notifyApplicationSubmitted(student, drive, app);

        verify(emailService, times(1)).sendHtmlEmailAsync(
                eq("s220145@rguktsklm.ac.in"),
                eq("Priya Patel"),
                eq("STUDENT"),
                contains("Application Submitted"),
                eq("<html>Confirmation</html>"),
                eq("APPLICATION_SUBMITTED"),
                eq("app-777"),
                eq("APP_SUBMIT_app-777")
        );
    }
}
