package com.shivsharan.HackFusion.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "report_status_history") // "report_status" is also a good name
@Data
public class ReportStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report reports;

    @Column(name = "status_date")
    private LocalDate date;

    private String status;
}
