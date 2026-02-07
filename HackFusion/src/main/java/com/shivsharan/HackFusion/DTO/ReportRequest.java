package com.shivsharan.HackFusion.DTO;


import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;
@Data
public class ReportRequest {
    UUID uid;
    LocalDate issue_since;
    String description;
    double lat;
    double lon;
    String media_url;
    UUID department_id;
}
