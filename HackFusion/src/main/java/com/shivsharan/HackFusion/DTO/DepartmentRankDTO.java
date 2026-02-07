package com.shivsharan.HackFusion.DTO;

import lombok.*;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentRankDTO {
    private UUID departmentId;
    private String departmentName;
    private Long totalReports;
    private Long resolvedReports;
    private Long unresolvedReports;
    private Double avgResolutionTimeInDays;
}