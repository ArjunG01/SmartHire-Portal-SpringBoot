package com.smarthire.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobDTO {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String location;
    private String jobType;
    private String skillsRequired;
    private Long recruiterId;
    private String recruiterName;
    private Integer vacancy;
    private String status;
    private LocalDateTime postedDate;
}
