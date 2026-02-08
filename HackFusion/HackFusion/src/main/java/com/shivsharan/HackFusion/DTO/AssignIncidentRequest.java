package com.shivsharan.HackFusion.DTO;

import lombok.*;

/**
 * DTO for assigning incident to field staff
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignIncidentRequest {

    private Long fieldStaffId;
    private Long departmentId;
    private String notes;
    private Integer estimatedDays;
}