package com.shivsharan.HackFusion.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity to store all tampering/deletion detection alerts
 * Tracks unauthorized attempts to modify audit logs
 */
@Entity
@Table(name = "tampering_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TamperingAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String alertType; // DATABASE_DELETION_DETECTED, TAMPERING_DETECTED_BOTH_DELETED, DELETION_NO_IPFS_BACKUP
    
    @Column(nullable = false)
    private LocalDateTime detectedAt;
    
    // Reference to the deleted audit log (may be null if log already removed)
    private Long deletedAuditLogId;
    
    @Column(nullable = true)
    private String deletedEventId;
    
    private String deletedAction;
    
    private String deletedEntityType;
    
    // IPFS status
    private String ipfsCid;
    private Boolean ipfsStillExists; // true if IPFS copy found, false if also deleted
    
    // Alert message and details
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Column(columnDefinition = "TEXT")
    private String details; // JSON with additional context
    
    // Alert status
    @Column(nullable = false)
    private String status; // NEW, IN_REVIEW, RESOLVED, IGNORED
    
    private LocalDateTime acknowledgedAt;
    private String acknowledgedByUserId;
    private String acknowledgedByUsername;
    
    // Additional context
    private String detectedByService; // IP, timestamp, etc
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW
}
