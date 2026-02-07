package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.DTO.ReportRequest;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Service.DepartmentService;
import com.shivsharan.HackFusion.Service.MLpipeline;
import com.shivsharan.HackFusion.Service.ReportService;
import com.shivsharan.HackFusion.DTO.ClassificationDetailsDto;
import com.shivsharan.HackFusion.Service.ReportService3;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Controller
public class ReportController {

    @Autowired
    ReportService reportService ;

    @Autowired
    ReportService3 reportService3 ;

    @Autowired
    MLpipeline mLpipeline ;
    @Autowired
    private DepartmentService departmentService;
    @PostMapping("/report")
    public ResponseEntity reportIssue(@RequestBody ReportRequest dto){
            Report r = reportService.save(dto);
            ClassificationDetailsDto classificationDetailsDto = mLpipeline.update(r);
//            r.setDepartment(departmentService.findByName(classificationDetailsDto.getFinalDepartment()));
//            r.setPriority(classificationDetailsDto.getFinalPriority());
            return ResponseEntity.ok().body(r.getId());
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
