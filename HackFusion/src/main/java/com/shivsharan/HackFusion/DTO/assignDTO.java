package com.shivsharan.HackFusion.DTO;

import lombok.Data;

import java.util.UUID;
@Data
public class assignDTO {
    public UUID reportID ;
    public UUID departmentID ;
    public UUID workerID ;
   // assign the report to the particular worker of the department
}
