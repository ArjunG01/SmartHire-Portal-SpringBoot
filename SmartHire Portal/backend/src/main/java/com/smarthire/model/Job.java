package com.smarthire.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String jobType; // Full-time, etc.

    @Column(nullable = false)
    private String skillsRequired; // Comma separated

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Column(name = "posted_date", updatable = false)
    private LocalDateTime postedDate;

    @Column(nullable = false)
    private Integer vacancy = 1;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, FILLED, PENDING

    @PrePersist
    protected void onCreate() {
        this.postedDate = LocalDateTime.now();
    }
}
