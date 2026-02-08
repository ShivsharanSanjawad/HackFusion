package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.DTO.DepartmentRankDTO;
import com.shivsharan.HackFusion.Model.Report;
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
public class ReportController2 {

    @Autowired
    ReportService3 reportService3 ;

    @PostMapping("/reOpen")
    public ResponseEntity reOpen(@RequestParam UUID reportId){
        reportService3.reOpen(reportId);
        return  ResponseEntity.ok().body("REOPENED");
    }

    @GetMapping("/getDepartmentsRankWise")
    public ResponseEntity getDepartmentsRankWise(){
        List<DepartmentRankDTO> ret = reportService3.getDepartmentsRankWise();
        return ResponseEntity.ok().body(ret) ;
    }
    @GetMapping("/getPDFReport")
    public ResponseEntity<String> getPDFReport(@RequestParam UUID reportID){
        String link = reportService3.getPDFReport(reportID);

        if (link == null || link.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(link);
    }

    @GetMapping("/getReport")
    public ResponseEntity<Report> getUpvotes(@RequestParam UUID reportID){
        Report ret = reportService3.getCompleteReport(reportID);

        if (ret == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ret);
    }

    @GetMapping("/getCivicScore")
    public ResponseEntity<Report> getCivicScore(@RequestParam UUID operatorID)
    {
        double ret = reportService3.getCivicScore(operatorID);
        return ret;
    }
}
