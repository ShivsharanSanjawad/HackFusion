package com.shivsharan.HackFusion.DTO;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OverallStatsDTO {
    private Long reportsThisWeek;
    private Long totalResolved;
    private Long totalUnresolved;
    private Long totalReports;
    private Double avgResolutionTimeInDays;
}