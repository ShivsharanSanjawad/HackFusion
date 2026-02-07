package com.shivsharan.HackFusion.DTO;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CompletionDTO {
    UUID reportID ;
    UUID workerID ;
    List<String> images ;
    String description ;
    LocalDate date;
}
