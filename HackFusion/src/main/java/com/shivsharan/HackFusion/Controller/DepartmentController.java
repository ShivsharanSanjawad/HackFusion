package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Annotation.Auditable;
import com.shivsharan.HackFusion.DTO.assignDTO;
import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Service.DepartmentService;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Service.ReportService;
import com.shivsharan.HackFusion.Service.ReportService2;
import com.shivsharan.HackFusion.Service.ReportService3;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/department")
public class DepartmentController {
    @Autowired
    ReportService reportService ;
    @Autowired
    ReportService2 reportService2 ;
    @Autowired
    DepartmentService departmentService;

    @Autowired
    ReportService3 reportService3;

    @GetMapping("/getID")
    public ResponseEntity getReports(@RequestParam String name){
        UUID ret = departmentService.findByName(name).getId();
        return ResponseEntity.ok().body(ret);
    }

    @GetMapping("/getReports")
    public ResponseEntity getReports(@RequestParam UUID departmentid){
        List<Report> ret =  reportService.getReports(departmentid);
        return ResponseEntity.ok().body(ret);
    }

    @GetMapping("/getWorkers")
    public ResponseEntity getWorkers(@RequestParam UUID departmentID){
        List<Operators> ret = reportService.getWorkers(departmentID);
        return ResponseEntity.ok().body(ret);
    }

    @Auditable(
            action = "WORKER_ASSIGNED",
            entityType = "DOCUMENT",
            uploadToIpfs = true  // Upload audit log to blockchain
    )
    @PutMapping("/assignWorkers")
    public ResponseEntity<String> assignWorker(@RequestBody assignDTO dto){
        reportService.assignWorker(dto);
        return ResponseEntity.ok().body("ASSIGNMENT DONE");
    }

    @GetMapping("/getReportStatus")
    public ResponseEntity reportStatus(@RequestParam UUID reportid){
        List<ReportStatus> ret = reportService.getReportStatus(reportid) ;
        return ResponseEntity.ok().body(ret);
    }
}
