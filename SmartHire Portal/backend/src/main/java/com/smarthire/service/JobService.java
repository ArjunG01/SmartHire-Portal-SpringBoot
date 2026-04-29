package com.smarthire.service;

import com.smarthire.dto.JobDTO;
import com.smarthire.model.Job;
import com.smarthire.model.User;
import com.smarthire.repository.JobRepository;
import com.smarthire.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    public JobDTO createJob(JobDTO jobDTO, String recruiterUsername) {
        User recruiter = userRepository.findByUsername(recruiterUsername)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        Job job = new Job();
        job.setTitle(jobDTO.getTitle());
        job.setDescription(jobDTO.getDescription());
        job.setCompanyName(jobDTO.getCompanyName());
        job.setLocation(jobDTO.getLocation());
        job.setJobType(jobDTO.getJobType());
        job.setSkillsRequired(jobDTO.getSkillsRequired());
        job.setRecruiter(recruiter);
        job.setVacancy(jobDTO.getVacancy() != null ? jobDTO.getVacancy() : 1);
        job.setStatus("OPEN");

        Job savedJob = jobRepository.save(job);
        return convertToDTO(savedJob);
    }

    public JobDTO updateJob(Long id, JobDTO jobDTO, String recruiterUsername) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getRecruiter().getUsername().equals(recruiterUsername)) {
            throw new RuntimeException("Unauthorized: You do not own this job");
        }

        job.setTitle(jobDTO.getTitle());
        job.setDescription(jobDTO.getDescription());
        job.setCompanyName(jobDTO.getCompanyName());
        job.setLocation(jobDTO.getLocation());
        job.setJobType(jobDTO.getJobType());
        job.setSkillsRequired(jobDTO.getSkillsRequired());
        if (jobDTO.getVacancy() != null)
            job.setVacancy(jobDTO.getVacancy());
        if (jobDTO.getStatus() != null)
            job.setStatus(jobDTO.getStatus());

        Job updatedJob = jobRepository.save(job);
        return convertToDTO(updatedJob);
    }

    public List<JobDTO> getAllJobs() {
        return jobRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<JobDTO> searchJobs(String keyword) {
        return jobRepository.searchJobs(keyword).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<JobDTO> getJobsByRecruiter(String username) {
        User recruiter = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
        return jobRepository.findByRecruiter(recruiter).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public Job getJobEntity(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public void deleteJob(Long id, String recruiterUsername) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getRecruiter().getUsername().equals(recruiterUsername)) {
            throw new RuntimeException("Unauthorized: You do not own this job");
        }

        jobRepository.delete(job);
    }

    public JobDTO getJobById(Long id) {
        return convertToDTO(getJobEntity(id));
    }

    private JobDTO convertToDTO(Job job) {
        JobDTO dto = new JobDTO();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setCompanyName(job.getCompanyName());
        dto.setLocation(job.getLocation());
        dto.setJobType(job.getJobType());
        dto.setSkillsRequired(job.getSkillsRequired());
        dto.setRecruiterId(job.getRecruiter().getId());
        dto.setRecruiterName(job.getRecruiter().getUsername());
        dto.setPostedDate(job.getPostedDate());
        dto.setVacancy(job.getVacancy());
        dto.setStatus(job.getStatus());
        return dto;
    }
}
