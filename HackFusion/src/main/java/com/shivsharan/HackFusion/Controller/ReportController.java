package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.DTO.ReportRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class ReportController {

    @PostMapping("/report")
    public ResponseEntity reportIssue(@RequestBody ReportRequest dto){
        return ResponseEntity.ok().build() ;
    }

}
