package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Annotation.Auditable;
import com.shivsharan.HackFusion.DTO.ReportRequest;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import com.shivsharan.HackFusion.Service.*;
import com.shivsharan.HackFusion.DTO.ClassificationDetailsDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ReportController {

    @Autowired
    ReportService reportService ;

    @Autowired
    ReportService3 reportService3 ;

    @Autowired
    MLpipeline mLpipeline ;
    @Autowired
    private DepartmentService departmentService;
    @Autowired
    private DuplicateCheckingService duplicateCheckingService;
    @Autowired
    private ReportRepository reportRepository;

    @Auditable(
            action = "REPORT_CREATED",
            entityType = "DOCUMENT",
            uploadToIpfs = true  // Upload audit log to blockchain
    )
    @PostMapping("/report")
    public ResponseEntity reportIssue(@RequestBody ReportRequest dto){
            Report r = reportService.save(dto);
            ClassificationDetailsDto classificationDetailsDto = mLpipeline.update(r);
            r.setDepartment(departmentService.findByName(classificationDetailsDto.getFinalDepartment()));
            r.setPriority(classificationDetailsDto.getFinalPriority());
            Report report2 = duplicateCheckingService.findDuplicate(r);

            if(report2 != null){
                report2.setUpvotes(report2.getUpvotes() + 1);
            }
            else{
                reportRepository.delete(r);
            }
            return ResponseEntity.ok().body(report2 == null ? report2.getId() : r.getId());
    }

    @GetMapping("/getAll")
    public ResponseEntity getReport()
    {
        List<Report> ret = reportService.getAll();
        return ResponseEntity.ok().body(ret);
    }
    @GetMapping("/getReportStatus")
    public ResponseEntity reportStatus(@RequestParam UUID reportid){
        List<ReportStatus> ret = reportService.getReportStatus(reportid) ;
        return ResponseEntity.ok().body(ret);
    }

    @GetMapping("/getReports")
    public ResponseEntity getReportsOfUser(@RequestParam UUID userId){
        List<Report> ret = reportService3.getReportsOfUser(userId);
        return ResponseEntity.ok().body(ret);
    }


}
