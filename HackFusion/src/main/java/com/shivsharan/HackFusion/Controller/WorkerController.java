package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.DTO.CompletionDTO;
import com.shivsharan.HackFusion.DTO.Status;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Service.ReportService;
import com.shivsharan.HackFusion.Service.ReportService2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/worker")
public class WorkerController {
    @Autowired
    ReportService reportService ;
    @Autowired
    ReportService2 reportService2 ;

    @GetMapping("/getTasks")
    public ResponseEntity getTasks(@RequestParam UUID workerId){
        reportService2.getTasks(workerId);
        return ResponseEntity.ok().body("ALL TASKS");
    }

    @PostMapping("/updateStatus")
    public ResponseEntity updateStatus(@RequestBody Status dto){
        reportService2.updateStatus(dto);
        return ResponseEntity.ok().body("DONE ");
    }

    @PostMapping("/completeReport")
    public ResponseEntity completeReport(@RequestBody CompletionDTO dto){
        reportService2.completeReportByWorker(dto);
        return ResponseEntity.ok().body("COMPLETED");
    }


}
