package com.smarthire.repository;

import com.smarthire.model.Application;
import com.smarthire.model.Job;
import com.smarthire.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Check if user already applied
    boolean existsByJobAndSeeker(Job job, User seeker);

    // Get applications by job (for Recruiter)
    List<Application> findByJob(Job job);

    // Get applications by seeker (for Job Seeker)
    List<Application> findBySeeker(User seeker);
}
