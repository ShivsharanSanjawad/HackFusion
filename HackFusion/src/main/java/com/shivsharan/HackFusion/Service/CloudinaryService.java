package com.shivsharan.HackFusion.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService{

    private Cloudinary cloudinary;

    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file, String folderName) {
        try{
            Map params = ObjectUtils.asMap(
                    "use_filename", false,
                    "unique_filename", true,
                    "overwrite", true,
                    "folder", folderName
            );
            Map uploadedFile = cloudinary.uploader().upload(file.getBytes(), params);
            String publicId = (String) uploadedFile.get("public_id");
            return (String) uploadedFile.get("secure_url");

        }catch (IOException e){
            e.printStackTrace();
            return null;
        }
    }

    public String uploadFile(String url, String folderName) {
        try {
            // Cloudinary can download directly from a URL!
            Map params = ObjectUtils.asMap(
                    "folder", folderName,
                    "use_filename", true,
                    "unique_filename", true,
                    "overwrite", false
            );

            // We pass the 'url' string directly to the .upload() method
            Map uploadResult = cloudinary.uploader().upload(url, params);

            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public String uploadFile(byte[] fileBytes, String fileName, String folderName) {
        try {
            Map params = ObjectUtils.asMap(
                    "folder", folderName,
                    "public_id", fileName + ".pdf",
                    "resource_type", "raw",
                    "overwrite", true,
                    "type", "upload"
            );

            Map uploadResult = cloudinary.uploader().upload(fileBytes, params);

            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

}
