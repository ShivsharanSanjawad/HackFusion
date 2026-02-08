package com.shivsharan.HackFusion.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Info
    @Column(nullable = false, unique = true)
    private String trackingCode; // e.g., "POTH-2024-0208-042"

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private IncidentType type;

    @Column(nullable = false, length = 1000)
    private String description;

    // Location Data
    @Column(nullable = false)
    private String location; // Address or description

    private Double latitude;
    private Double longitude;

    private String city;
    private String area;
    private String pincode;

    // Status & Workflow
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private IncidentStatus status = IncidentStatus.OPEN;

    @Enumerated(EnumType.STRING)
    private IncidentPriority priority = IncidentPriority.MEDIUM;

    // Citizen Info
    @Column(nullable = false)
    private Long reportedBy; // User ID of citizen

    private String reporterName;
    private String reporterEmail;
    private String reporterPhone;

    // Assignment Info
    private Long assignedTo; // User ID of field worker
    private String assignedToName;

    private Long assignedBy; // User ID of officer who assigned

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    private Long departmentId;
    private String departmentName;

    // Resolution Info
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private Long resolvedBy; // User ID who resolved

    // Media
    @Column(length = 2000)
    private String imageUrls; // Comma-separated image URLs or IPFS CIDs

    // Timestamps
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime statusChangedAt = LocalDateTime.now();

    // Metadata
    private Integer estimatedResolutionDays;
    private String category; // Sub-category (e.g., "Road Damage" -> "Pothole")

    @Column(length = 500)
    private String internalNotes; // For department use only

    // Duplicate handling
    private Long duplicateOf; // If this is a duplicate, reference to original
    private Boolean isDuplicate = false;

    // Lifecycle hooks
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.trackingCode == null) {
            this.trackingCode = generateTrackingCode();
        }
    }

    private String generateTrackingCode() {
        // Format: TYPE-YYYY-MMDD-ID
        // Example: POTH-2024-0208-042
        LocalDateTime now = LocalDateTime.now();
        String typeCode = this.type != null ? this.type.getCode() : "UNKN";
        return String.format("%s-%d-%02d%02d-%03d",
                typeCode,
                now.getYear(),
                now.getMonthValue(),
                now.getDayOfMonth(),
                (this.id != null ? this.id : 0)
        );
    }
}