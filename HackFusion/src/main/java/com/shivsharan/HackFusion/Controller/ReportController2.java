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

@Controller
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
    public ResponseEntity getPDFReport(@RequestParam UUID reportID){
        byte[] pdfBytes = reportService3.getPDFReport(reportID);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=issue_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/getReport")
    public ResponseEntity getUpvotes(@RequestParam UUID reportID){
        Report ret = reportService3.getCompleteReport(reportID);
        return ResponseEntity.ok().body(ret);
    }
}
