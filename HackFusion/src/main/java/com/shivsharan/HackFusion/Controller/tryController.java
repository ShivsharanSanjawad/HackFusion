package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Annotation.Auditable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class tryController {
    @Auditable(action = "INCIDENT_CREATED", entityType = "INCIDENT",uploadToIpfs = true)
    @GetMapping("/tryAuditing")
    public ResponseEntity trrt(){
        return ResponseEntity.ok("DONE");
    }
}
