package com.shivsharan.HackFusion.DTO;

import com.shivsharan.HackFusion.Entity.IncidentType;
import lombok.*;

/**
 * DTO for creating a new incident (from citizen)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateIncidentRequest {

    private IncidentType type;
    private String description;

    // Location
    private String location;
    private Double latitude;
    private Double longitude;
    private String city;
    private String area;
    private String pincode;

    // Reporter info (if not logged in)
    private String reporterName;
    private String reporterEmail;
    private String reporterPhone;

    // Media
    private String[] imageUrls;
}