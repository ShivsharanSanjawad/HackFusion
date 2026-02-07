package com.shivsharan.HackFusion.Controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.shivsharan.HackFusion.Annotation.Auditable;
import com.shivsharan.HackFusion.Service.PinataService;

@RestController
@RequestMapping("/api/ipfs")
public class IpfsController {

    private final PinataService pinataService;

    public IpfsController(PinataService pinataService) {
        this.pinataService = pinataService;
    }

    /**
     * Upload a file to IPFS via Pinata
     * This endpoint is audited - all uploads are logged with checksums and can be uploaded to blockchain
     *
     * @param file The file to upload
     * @return The CID (Content Identifier) of the uploaded file
     * @throws Exception if upload fails
     */
    @Auditable(
            action = "FILE_UPLOADED",
            entityType = "DOCUMENT",
            uploadToIpfs = true  // Upload audit log to blockchain
    )
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
