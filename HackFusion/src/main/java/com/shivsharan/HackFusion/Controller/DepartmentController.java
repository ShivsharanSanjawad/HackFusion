package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.DTO.assignDTO;
import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Service.ReportService;
import com.shivsharan.HackFusion.Service.ReportService2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping("/department")
public class DepartmentController {
    @Autowired
    ReportService reportService ;
    @Autowired
    ReportService2 reportService2 ;

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

    @PutMapping("/closeReport")
    public ResponseEntity closeReport(@RequestBody UUID reportID){
        String ret = reportService2.closeReport(reportID);
        return ResponseEntity.ok().body(ret);
    }

}
