package com.smarthire.controller;

import com.smarthire.dto.JobDTO;
import com.smarthire.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    // Public: Get all jobs
    @GetMapping("/public")
    public List<JobDTO> getAllJobs() {
        return jobService.getAllJobs();
    }

    // Public: Search
    @GetMapping("/search")
    public List<JobDTO> searchJobs(@RequestParam String keyword) {
        return jobService.searchJobs(keyword);
    }

    // Public: Get details
    @GetMapping("/{id}")
    public JobDTO getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    // Recruiter: Post Job
    @PostMapping("/")
    @PreAuthorize("hasAuthority('RECRUITER')")
    public ResponseEntity<JobDTO> postJob(@RequestBody JobDTO jobDTO, Principal principal) {
        return ResponseEntity.ok(jobService.createJob(jobDTO, principal.getName()));
    }

    // Recruiter: Get My Jobs
    @GetMapping("/my-jobs")
    @PreAuthorize("hasAuthority('RECRUITER')")
    public List<JobDTO> getMyJobs(Principal principal) {
        return jobService.getJobsByRecruiter(principal.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('RECRUITER')")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, Principal principal) {
        try {
            jobService.deleteJob(id, principal.getName());
            return ResponseEntity.ok("Job deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RECRUITER')")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody JobDTO jobDTO, Principal principal) {
        try {
            return ResponseEntity.ok(jobService.updateJob(id, jobDTO, principal.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
