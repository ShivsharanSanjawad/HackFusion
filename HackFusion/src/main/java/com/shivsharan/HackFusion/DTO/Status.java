package com.shivsharan.HackFusion.DTO;

import java.time.LocalDate;
import java.util.UUID;

public class Status {
    UUID reportID ;
    UUID departmentId ;
    UUID workerId ;
    String newStatus ;
    LocalDate currDate ;
    String description ;
}
