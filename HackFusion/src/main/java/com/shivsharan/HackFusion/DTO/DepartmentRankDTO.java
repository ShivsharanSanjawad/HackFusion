package com.shivsharan.HackFusion.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class DepartmentRankDTO {

    private UUID departmentId;
    private String departmentName;

    private long totalReports;
    private long resolvedReports;
    private long unresolvedReports;

    private double avgResolutionDays;
}
