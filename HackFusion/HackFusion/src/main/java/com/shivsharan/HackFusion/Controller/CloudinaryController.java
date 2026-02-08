package com.shivsharan.HackFusion.Controller;

import com.cloudinary.Url;
import com.shivsharan.HackFusion.Service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;

@RestController
public class CloudinaryController {
    private CloudinaryService cloudinaryService;

    @Autowired
    public CloudinaryController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping(value = "/cloudinary", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

    @GetMapping(value = "/cloudinary")
    public ResponseEntity<Resource> getFile(@RequestParam("fileName") String fileName) {
        try {
            URL url = new URL(fileName);
            Resource resource = new UrlResource(url.toURI());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }


}
