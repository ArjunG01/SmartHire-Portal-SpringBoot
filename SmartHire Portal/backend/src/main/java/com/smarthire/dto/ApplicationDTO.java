package com.smarthire.dto;

import com.smarthire.model.ApplicationStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApplicationDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private Long seekerId;
    private String seekerName;
    private String seekerEmail;
    private String resumePath; // For Recruiter view
    private ApplicationStatus status;
    private LocalDateTime appliedDate;
}
