package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Annotation.Auditable;
import com.shivsharan.HackFusion.DTO.DepartmentRankDTO;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import com.shivsharan.HackFusion.Service.ReportService3;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
public class ReportController2 {

    @Autowired
    private ReportService3 reportService3;

    @Autowired
    private ReportRepository reportRepository;

    @PostMapping("/reOpen")
    public ResponseEntity<String> reOpen(@RequestParam UUID reportID) {
        // Fetches report, sets status to 'PENDING' or 'IN_PROGRESS', and saves
        reportService3.reOpen(reportID);
        return ResponseEntity.ok().body("REOPENED");
    }
    @Auditable(
            action = "REPORT_CLOSED",
            entityType = "DOCUMENT",
            uploadToIpfs = true  // Upload audit log to blockchain
    )
    @PutMapping("/closeReport")
    public ResponseEntity<String> closeReport(@RequestParam UUID reportID) {
        // 1. Fetch the report from the DB
        Report report = reportRepository.findById(reportID)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // 2. Update the status to 'CLOSED'
        report.setStatus("CLOSED");

        // 3. Save the updated report record
        reportRepository.save(report);

        // 4. Generate the PDF
        // Note: Ensure your PDF template handles null departments to avoid FTL errors
        String link = reportService3.getPDFReport(reportID);

        if (link == null || link.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Status updated to CLOSED, but PDF generation failed.");
        }

        return ResponseEntity.ok(link);
    }

    @GetMapping("/getDepartmentsRankWise")
    public ResponseEntity<List<DepartmentRankDTO>> getDepartmentsRankWise() {
        List<DepartmentRankDTO> ret = reportService3.getDepartmentsRankWise();
        return ResponseEntity.ok().body(ret);
    }

    @GetMapping("/getPDFReport")
    public ResponseEntity<String> getPDFReport(@RequestParam UUID reportID) {
        String link = reportService3.getPDFReport(reportID);
        if (link == null || link.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(link);
    }

    @GetMapping("/getReport")
    public ResponseEntity<Report> getReport(@RequestParam UUID reportID) {
        Report ret = reportService3.getCompleteReport(reportID);
        if (ret == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ret);
    }

    @GetMapping("/getCivicScore")
    public double getCivicScore(@RequestParam UUID operatorID) {
        return reportService3.getCivicScore(operatorID);
    }
}