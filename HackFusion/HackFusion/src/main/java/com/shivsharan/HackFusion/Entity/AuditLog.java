package com.shivsharan.HackFusion.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_log")
@EntityListeners(AuditLogDeleteListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventId; // UUID

    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Actor info
    private Long actorId;
    private String actorType; // CITIZEN, OFFICER, FIELD_STAFF
    private String actorUsername;

    // Entity info
    @Column(nullable = false)
    private String entityType;

    // Nullable because some audited methods may not be entity-specific
    private Long entityId;

    @Column(nullable = false)
    private String action;

    // Change tracking
    @Column(columnDefinition = "TEXT")
    private String oldState; // JSON

    @Column(columnDefinition = "TEXT")
    private String newState; // JSON

    // Context
    private String description;
    private String ipAddress;

    // IPFS fields
    private String ipfsCid; // The CID from Pinata
    private String ipfsUploadStatus; // PENDING, SUCCESS, FAILED
    private LocalDateTime ipfsUploadedAt;

    // Blockchain-style chaining
    @Column(nullable = false)
    private String checksum;

    private String previousChecksum;
}