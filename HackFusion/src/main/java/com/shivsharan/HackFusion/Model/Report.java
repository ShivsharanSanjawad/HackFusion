package com.shivsharan.HackFusion.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "report")
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", nullable = false)
    private Operators operators; // This creates the foreign key to the Operator table

    @Column(name = "entry_date")
    private LocalDate entryDate;

    @Column(name = "media_url")
    private String mediaUrl;

    private String status;

    private int priority;
}
