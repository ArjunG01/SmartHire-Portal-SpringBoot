package com.smarthire.repository;

import com.smarthire.model.Job;
import com.smarthire.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Find jobs by recruiter
    List<Job> findByRecruiter(User recruiter);

    // Search jobs (Simple search)
    // "title LIKE" OR "skills LIKE" OR "company LIKE" OR "location LIKE"
    @Query("SELECT j FROM Job j WHERE " +
            "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.skillsRequired) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.jobType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Job> searchJobs(@Param("keyword") String keyword);
}
