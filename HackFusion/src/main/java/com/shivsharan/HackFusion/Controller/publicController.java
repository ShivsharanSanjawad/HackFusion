package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.DTO.OverallStatsDTO;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Service.ReportService3;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class publicController {

    @Autowired
    ReportService3 reportService3 ;
    @GetMapping("/getStat")
    public ResponseEntity getStats(){
        OverallStatsDTO stats = reportService3.getStats();
        return ResponseEntity.ok(stats);
    }
    @GetMapping("/clump")
    public ResponseEntity createClump(double lat, double lon, double dist){
        List<Report> stats = reportService3.getClump(lat, lon, dist);
        return ResponseEntity.ok("NOT DONE");
    }
}
