package com.placement.system.controller;

import com.placement.system.dto.ApplyDriveRequestDto;
import com.placement.system.model.PlacementApplication;
import com.placement.system.service.JwtService;
import com.placement.system.service.PlacementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/placement")
public class PlacementController {

    @Autowired
    private PlacementService placementService;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/drives")
    public ResponseEntity<?> getDrives(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                userId = jwtService.extractUserId(authHeader.substring(7));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(placementService.getStudentDrives(userId));
    }

    @PostMapping("/upload-resume")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                userId = jwtService.extractUserId(authHeader.substring(7));
            } catch (Exception ignored) {}
        }

        try {
            Map<String, Object> resp = placementService.uploadResume(file, userId);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to store resume document: " + e.getMessage()));
        }
    }

    @GetMapping("/resumes/{fileName:.+}")
    public ResponseEntity<Resource> viewResume(@PathVariable String fileName) {
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }
        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "resumes";
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lower.endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else if (lower.endsWith(".doc")) {
                contentType = "application/msword";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/drives/{id}/apply")
    public ResponseEntity<?> applyForDrive(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id,
            @RequestBody(required = false) ApplyDriveRequestDto body) {

        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        try {
            PlacementApplication app = placementService.applyForDrive(id, userId, body);
            return ResponseEntity.ok(app);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            if ("Already applied for this campus drive".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtService.extractUserId(authHeader.replace("Bearer ", ""));
        List<PlacementApplication> apps = placementService.getStudentApplications(userId);
        return ResponseEntity.ok(apps);
    }
}
