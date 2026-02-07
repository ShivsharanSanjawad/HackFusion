package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Service.ReportService3;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class publicController {

    @Autowired
    ReportService3 reportService3 ;
    @GetMapping("/getStat")
    public ResponseEntity getStats(){
        reportService3.getStats();
        return ResponseEntity.ok().body();
    }
}
