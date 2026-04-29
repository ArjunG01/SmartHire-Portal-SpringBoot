package com.smarthire.controller;

import com.smarthire.dto.ApplicationDTO;
import com.smarthire.model.ApplicationStatus;
import com.smarthire.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    // Seeker: Apply (Step 8 part)
    @PostMapping(value = "/{jobId}/apply", consumes = { "multipart/form-data" })
    @PreAuthorize("hasAuthority('JOB_SEEKER')")
    public ResponseEntity<?> applyForJob(@PathVariable Long jobId,
            @RequestParam("resume") org.springframework.web.multipart.MultipartFile resume, Principal principal) {
        try {
            applicationService.applyForJob(jobId, principal.getName(), resume);
            return ResponseEntity.ok("Applied successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Seeker: My Applications
    @GetMapping("/my-applications")
    @PreAuthorize("hasAuthority('JOB_SEEKER')")
    public List<ApplicationDTO> getMyApplications(Principal principal) {
        return applicationService.getMyApplications(principal.getName());
    }

    // Recruiter: Get applications for a job (Step 9)
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAuthority('RECRUITER')")
    public List<ApplicationDTO> getJobApplications(@PathVariable Long jobId) {
        // ideally add check if job belongs to recruiter
        return applicationService.getApplicationsForJob(jobId);
    }

    // Recruiter: Update Status (Step 9)
    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasAuthority('RECRUITER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long applicationId, @RequestParam ApplicationStatus status) {
        applicationService.updateStatus(applicationId, status);
        return ResponseEntity.ok("Status updated");
    }
}
