package com.shivsharan.HackFusion.DTO;


import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;
@Data
public class ReportRequest {
    UUID uid ;
    LocalDate date ;
    String description ;
}
