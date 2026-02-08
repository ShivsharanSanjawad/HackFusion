package com.shivsharan.HackFusion.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", nullable = false)
    private Operators senders;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_id", nullable = true)
    private Operators workers;

    @Column(name = "entry_date")
    private LocalDate entryDate;

    @Column(name = "issue_since")
    private LocalDate issueSince;

    @Column(name = "media_url", columnDefinition = "text[]")
    private List<String> media_url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Department department;

    private String description;

    private String status;

    private int priority;

    private int upvotes;

    private double lat;

    private double lon;

    private String pdf_url;
}
