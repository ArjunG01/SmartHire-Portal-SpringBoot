package com.smarthire.controller;

import com.smarthire.model.User;
import com.smarthire.service.FileStorageService;
import com.smarthire.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/profile")
    public User getProfile(Principal principal) {
        return userService.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/upload-resume")
    @PreAuthorize("hasAuthority('JOB_SEEKER')")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file, Principal principal) {
        try {
            String filename = fileStorageService.storeFile(file);
            User user = userService.findByUsername(principal.getName()).get();
            user.setResumePath(filename);
            userService.updateUser(user);
            return ResponseEntity.ok("Resume uploaded successfully: " + filename);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/resume/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getResume(@PathVariable String filename) {
        try {
            Path file = fileStorageService.load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
