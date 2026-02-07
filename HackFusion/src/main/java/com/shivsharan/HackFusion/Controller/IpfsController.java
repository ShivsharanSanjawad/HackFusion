package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Service.PinataService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.InputStreamResource;

@RestController
@RequestMapping("/api/ipfs")
public class IpfsController {

    private final PinataService pinataService;

    public IpfsController(PinataService pinataService) {
        this.pinataService = pinataService;
    }

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public String uploadFile(
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        return pinataService.uploadFileToIpfs(file.getResource());
    }
}
