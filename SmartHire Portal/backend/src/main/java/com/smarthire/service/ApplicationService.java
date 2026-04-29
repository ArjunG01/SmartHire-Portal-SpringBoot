package com.smarthire.service;

import com.smarthire.dto.ApplicationDTO;
import com.smarthire.model.*;
import com.smarthire.repository.ApplicationRepository;
import com.smarthire.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobService jobService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public Application applyForJob(Long jobId, String seekerUsername,
            org.springframework.web.multipart.MultipartFile resume) {
        User seeker = userRepository.findByUsername(seekerUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobService.getJobEntity(jobId);

        if (applicationRepository.existsByJobAndSeeker(job, seeker)) {
            throw new RuntimeException("You have already applied for this job!");
        }

        String path = fileStorageService.storeFile(resume);

        Application application = new Application();
        application.setJob(job);
        application.setSeeker(seeker);
        application.setStatus(ApplicationStatus.PENDING);
        application.setResumePath(path);

        return applicationRepository.save(application);
    }

    public List<ApplicationDTO> getApplicationsForJob(Long jobId) {
        Job job = jobService.getJobEntity(jobId);
        return applicationRepository.findByJob(job).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ApplicationDTO> getMyApplications(String seekerUsername) {
        User seeker = userRepository.findByUsername(seekerUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findBySeeker(seeker).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public Application updateStatus(Long applicationId, ApplicationStatus status) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(status);
        return applicationRepository.save(app);
    }

    private ApplicationDTO convertToDTO(Application app) {
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(app.getId());
        dto.setJobId(app.getJob().getId());
        dto.setJobTitle(app.getJob().getTitle());
        dto.setCompanyName(app.getJob().getCompanyName());
        dto.setSeekerId(app.getSeeker().getId());
        dto.setSeekerName(app.getSeeker().getUsername());
        dto.setSeekerEmail(app.getSeeker().getEmail());
        dto.setResumePath(app.getResumePath());
        dto.setStatus(app.getStatus());
        dto.setAppliedDate(app.getAppliedDate());
        return dto;
    }
}
