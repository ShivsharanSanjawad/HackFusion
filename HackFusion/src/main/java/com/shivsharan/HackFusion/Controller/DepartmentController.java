package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/department")
public class DepartmentController {
    @Autowired
    ReportService reportService ;

    @GetMapping("/getReports")
    public ResponseEntity getReports(@RequestParam UUID departmentid){
        reportService.getReports(departmentid);
        return ResponseEntity.ok().body("LIST OF REPORTS OF DEPARTMENT");
    }

    @GetMapping("/getWorkers")
    public ResponseEntity getWorkers(@RequestParam UUID departmentID){
        reportService.getWorkers(departmentID);
        return ResponseEntity.ok().body("LIST OF WORKERS OF DEPARTMENT");
    }

    
}
