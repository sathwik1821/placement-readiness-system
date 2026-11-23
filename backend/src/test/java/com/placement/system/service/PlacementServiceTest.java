package com.placement.system.service;

import com.placement.system.dto.ApplyDriveRequestDto;
import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.Student;
import com.placement.system.repository.NotificationRepository;
import com.placement.system.repository.PlacementApplicationRepository;
import com.placement.system.repository.PlacementDriveRepository;
import com.placement.system.repository.PlacementOfficerRepository;
import com.placement.system.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlacementServiceTest {

    @Mock
    private PlacementDriveRepository driveRepository;

    @Mock
    private PlacementApplicationRepository applicationRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private PlacementOfficerRepository officerRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PlacementService placementService;

    private Student sampleStudent;
    private PlacementDrive sampleDrive;

    @BeforeEach
    void setUp() {
        sampleStudent = new Student();
        sampleStudent.setId("student-1");
        sampleStudent.setUserId("user-1");
        sampleStudent.setName("Sathwik");
        sampleStudent.setCgpa(8.5);
        sampleStudent.setBacklogs(0);
        sampleStudent.setDepartment("Computer Science & Engineering");
        sampleStudent.setYear(4);
        sampleStudent.setGraduationYear(2027);

        sampleDrive = new PlacementDrive();
        sampleDrive.setId("drive-100");
        sampleDrive.setTitle("Google Cloud");
        sampleDrive.setJobRole("Software Engineer");
        sampleDrive.setStatus("PUBLISHED");
        sampleDrive.setDeadline(LocalDateTime.now().plusDays(5));
        sampleDrive.setEligibilityCriteria("{\"minCgpa\":7.5,\"maxBacklogs\":0,\"departments\":[\"Computer Science & Engineering\"],\"allowedYears\":[4]}");
    }

    @Test
    @DisplayName("Should successfully submit application for eligible student")
    void applyForDrive_EligibleStudent_CreatesApplication() {
        when(studentRepository.findByUserId("user-1")).thenReturn(Optional.of(sampleStudent));
        when(applicationRepository.findByStudentIdAndDriveId("student-1", "drive-100")).thenReturn(Optional.empty());
        when(driveRepository.findById("drive-100")).thenReturn(Optional.of(sampleDrive));
        when(applicationRepository.save(any(PlacementApplication.class))).thenAnswer(i -> {
            PlacementApplication app = i.getArgument(0);
            app.setId("app-new-999");
            return app;
        });
        when(officerRepository.findAll()).thenReturn(List.of());

        ApplyDriveRequestDto req = new ApplyDriveRequestDto("/resumes/sample.pdf", "SampleResume.pdf");
        PlacementApplication app = placementService.applyForDrive("drive-100", "user-1", req);

        assertNotNull(app);
        assertEquals("app-new-999", app.getId());
        assertEquals("student-1", app.getStudentId());
        assertEquals("drive-100", app.getDriveId());
        verify(notificationService, times(1)).notifyApplicationSubmitted(eq(sampleStudent), eq(sampleDrive), any(PlacementApplication.class));
    }

    @Test
    @DisplayName("Should reject application if student has already applied")
    void applyForDrive_AlreadyApplied_ThrowsConflictException() {
        when(studentRepository.findByUserId("user-1")).thenReturn(Optional.of(sampleStudent));
        when(applicationRepository.findByStudentIdAndDriveId("student-1", "drive-100"))
                .thenReturn(Optional.of(new PlacementApplication("student-1", "drive-100")));

        ApplyDriveRequestDto req = new ApplyDriveRequestDto();

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> placementService.applyForDrive("drive-100", "user-1", req));
        assertEquals("Already applied for this campus drive", ex.getMessage());
    }

    @Test
    @DisplayName("Should reject application if student does not meet CGPA requirement")
    void applyForDrive_LowCgpa_ThrowsEligibilityException() {
        sampleStudent.setCgpa(6.8); // Below 7.5 required
        when(studentRepository.findByUserId("user-1")).thenReturn(Optional.of(sampleStudent));
        when(applicationRepository.findByStudentIdAndDriveId("student-1", "drive-100")).thenReturn(Optional.empty());
        when(driveRepository.findById("drive-100")).thenReturn(Optional.of(sampleDrive));

        ApplyDriveRequestDto req = new ApplyDriveRequestDto();

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> placementService.applyForDrive("drive-100", "user-1", req));
        assertTrue(ex.getMessage().contains("Minimum CGPA requirement"));
    }

    @Test
    @DisplayName("Should reject application if drive deadline has already passed")
    void applyForDrive_DeadlinePassed_ThrowsException() {
        sampleDrive.setDeadline(LocalDateTime.now().minusHours(2));
        when(studentRepository.findByUserId("user-1")).thenReturn(Optional.of(sampleStudent));
        when(applicationRepository.findByStudentIdAndDriveId("student-1", "drive-100")).thenReturn(Optional.empty());
        when(driveRepository.findById("drive-100")).thenReturn(Optional.of(sampleDrive));

        ApplyDriveRequestDto req = new ApplyDriveRequestDto();

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> placementService.applyForDrive("drive-100", "user-1", req));
        assertEquals("Application deadline has passed", ex.getMessage());
    }
}
