package com.shivsharan.HackFusion.Controller;

import com.google.j2objc.annotations.AutoreleasePool;
import com.shivsharan.HackFusion.DTO.ReportRequest;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Service.MLpipeline;
import com.shivsharan.HackFusion.Service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
public class ReportController {

    @Autowired
    ReportService reportService ;

    @Autowired
    MLpipeline mLpipeline ;

    @PostMapping("/report")
    public ResponseEntity reportIssue(@RequestBody ReportRequest dto){
            Report r = reportService.save(dto) ;
            mLpipeline.update(r);
            return ResponseEntity.ok().body(r.getId());
    }

    @GetMapping("/getReportStatus")
    public ResponseEntity reportStatus(@RequestParam UUID id){
        reportService.getReports(id) ;
        return ResponseEntity.ok().body("Jell");
    }




}
