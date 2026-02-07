package com.shivsharan.HackFusion.DTO;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Data Transfer Object for audit events
 * Used to pass audit information between layers
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvent {

    // Event identification
    private String eventId;
    private LocalDateTime timestamp;

    // Actor information (who did the action)
    private Long actorId;
    private String actorUsername;
    private String actorType; // CITIZEN, DEPARTMENT_OFFICER, FIELD_STAFF, SYSTEM

    // Entity information (what was affected)
    private String entityType; // INCIDENT, USER, ASSIGNMENT, etc.
    private Long entityId;

    // Action information
    private String action; // INCIDENT_CREATED, STATUS_CHANGED, ASSIGNED, etc.

    // State tracking
    private String oldState; // JSON representation of old state
    private String newState; // JSON representation of new state
    private String[] changedFields; // Which fields changed

    // Context
    private String description;
    private String ipAddress;
    private String userAgent;
    private String sessionId;

    // Metadata (flexible JSON)
    private Map<String, Object> metadata;

    // Correlation
    private String correlationId; // Link related events

    // Flags
    private boolean uploadToIpfs = true;
    private boolean success = true;

    // Additional context
    public void addMetadata(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new java.util.HashMap<>();
        }
        this.metadata.put(key, value);
    }
}