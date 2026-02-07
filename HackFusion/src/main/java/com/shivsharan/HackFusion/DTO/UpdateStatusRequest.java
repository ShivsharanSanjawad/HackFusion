package com.shivsharan.HackFusion.DTO;

import com.shivsharan.HackFusion.Entity.IncidentStatus;
import lombok.*;

/**
 * DTO for updating incident status
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStatusRequest {

    private IncidentStatus newStatus;
    private String reason;
    private String notes;
}