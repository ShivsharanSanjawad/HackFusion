package com.shivsharan.HackFusion.DTO;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
@Data
public class CompletionDTO {
    UUID reportID ;
    UUID workerID ;
    List<String> images ;
    String description ;
    LocalDate date;
}
