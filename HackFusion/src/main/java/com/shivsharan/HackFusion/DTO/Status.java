package com.shivsharan.HackFusion.DTO;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;
@Data
public class Status {
    UUID reportID ;
    UUID departmentId ;
    UUID workerId ;
    String newStatus ;
    LocalDate currDate ;
    String description ;
}
