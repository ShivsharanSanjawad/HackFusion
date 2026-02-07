package com.shivsharan.HackFusion.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", nullable = false)
    private Operators operators;

    @Column(name = "entry_date")
    private LocalDate entryDate;

    @Column(name = "issue_since")
    private LocalDate issueSince;

    @Column(name = "media_url")
    private String mediaUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    private String description;

    private String status;

    private int priority;

    private int upvotes;

    private double lat;

    private double lon;
}
