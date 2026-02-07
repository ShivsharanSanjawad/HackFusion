package com.shivsharan.HackFusion.DTO;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO for incident response (to frontend)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentResponse {

    private Long id;
    private String trackingCode;
    private String type;
    private String status;
    private String priority;
    private String description;
    private String location;
    private Double latitude;
    private Double longitude;

    private String reporterName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String assignedToName;
    private String departmentName;

    private String resolutionNotes;
    private LocalDateTime resolvedAt;

    private String[] imageUrls;

    // IPFS proof (for transparency)
    private String ipfsCid;

    public static IncidentResponse fromEntity(com.shivsharan.HackFusion.Entity.Incident incident) {
        return IncidentResponse.builder()
                .id(incident.getId())
                .trackingCode(incident.getTrackingCode())
                .type(incident.getType().getDisplayName())
                .status(incident.getStatus().getDisplayName())
                .priority(incident.getPriority().getDisplayName())
                .description(incident.getDescription())
                .location(incident.getLocation())
                .latitude(incident.getLatitude())
                .longitude(incident.getLongitude())
                .reporterName(incident.getReporterName())
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .assignedToName(incident.getAssignedToName())
                .departmentName(incident.getDepartmentName())
                .resolutionNotes(incident.getResolutionNotes())
                .resolvedAt(incident.getResolvedAt())
                .imageUrls(incident.getImageUrls() != null ?
                        incident.getImageUrls().split(",") : new String[0])
                .build();
    }
}