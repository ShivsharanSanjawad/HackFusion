package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URL;

@RestController
public class CloudinaryController {
    private CloudinaryService cloudinaryService;

    @Autowired
    public CloudinaryController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> UploadFile(@RequestParam("file") MultipartFile file,
                                             @RequestParam("folder_name") String folder_name){
        if(file.isEmpty()){
            return ResponseEntity.badRequest().body("File is empty");
        }
        String link = cloudinaryService.uploadFile(file, folder_name);
        if(link!=null && !link.isEmpty()){
            return ResponseEntity.ok().body(link);
        }
        else{
            return ResponseEntity.internalServerError().body("file not saved");
        }
    }

}
