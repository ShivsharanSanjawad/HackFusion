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
    public double getCivicScore(@RequestParam UUID operatorID)
    {
        return reportService3.getCivicScore(operatorID);
    }

    @PutMapping("/closeReport")
    public ResponseEntity<String> closeReport(@RequestParam UUID reportID) {
        // 1. Fetch the report from the DB
        Report report = reportRepository.findById(reportID)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // 2. Update the status
        report.setStatus("CLOSED");

        // 3. Save the updated report
        reportRepository.save(report);

        // 4. Generate the PDF
        String link = reportService3.getPDFReport(reportID);

        if (link == null || link.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Status updated to CLOSED, but PDF generation failed.");
        }

        return ResponseEntity.ok(link);
    }
}
