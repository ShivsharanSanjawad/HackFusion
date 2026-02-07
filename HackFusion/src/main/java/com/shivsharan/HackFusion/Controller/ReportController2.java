package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Service.ReportService3;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@Controller
public class ReportController2 {

    @Autowired
    ReportService3 reportService3 ;

    @PutMapping("/reopen")
    public ResponseEntity reOpen(@RequestBody UUID reportId){
        reportService3.reOpen(reportId);
        return  ResponseEntity.ok().body("REOPENED");
    }

    @GetMapping("/getDepartmentsRankWise")
    public ResponseEntity getDepartmentsRankWise(){
        reportService3.getDepartmentsRankWise();
        return ResponseEntity.ok().build() ;
    }
    @GetMapping("/getReport")
    public ResponseEntity getPDFReport(@RequestParam UUID reportID){
        reportService3.getPDFReport(reportID);
        return ResponseEntity.ok().build() ;
    }
    @GetMapping("/getReport")
    public ResponseEntity getUpvotes(@RequestParam UUID reportID){
        reportService3.getCompleteReport(reportID);
        return ResponseEntity.ok().body("REPO");
    }
}
