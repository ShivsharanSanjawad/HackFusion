package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.DTO.ClassificationDetailsDto;
import jakarta.ws.rs.client.Entity;
import org.apache.logging.log4j.simple.SimpleLogger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.MimeTypeUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

@Component
public class MLpipeline {

    private final ChatClient chatClient;
    private Logger logger = LoggerFactory.getLogger(MLpipeline.class);

    @Autowired
    public MLpipeline(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }


    // Kept your prompt exactly as is
    private final String promptTemplate = """
        You are an AI assistant for a generic 'Civil Issue Registration' system.
        Your task is to analyze the attached image of a public grievance and validate/fill in the metadata.
        
        ### 1. CONTEXT (User Input)
        The user has submitted this report with the following details (some may be empty or incorrect):
        - Issue Since: %s
        - User Description: %s
        - User Selected Department: %s
        - User Selected Priority: %s
        
        ### 2. ALLOWED DEPARTMENTS
        You must assign the issue to one of these exact departments:
        %s
        
        ### 3. INSTRUCTIONS
        Analyze the image and perform the following logic:
        
        1. **Department:** - Identify the core issue in the image (e.g., pothole = Roads, broken pipe = Water).
           - If the 'User Selected Department' is empty OR clearly contradicts the image, assign the correct one from the 'Allowed Departments' list.
        
        2. **Priority (Numerical 1-5, 5 being the highest and 1 being the lowest):**
           - Assess the severity based on the image (e.g., massive sinkhole = Critical, small graffiti = Low).
           - If 'User Selected Priority' is empty OR inappropriate for the visible severity, override it with your assessment.
        
        3. **Description:**
           - If 'User Description' is empty, write a concise, technical description of the visual damage (e.g., "Large asphalt deterioration approximately 1 meter wide").
           - If 'User Description' is present but vague (e.g., "bad road"), append technical details to it.
        
        4. **Issue Since:**
           - Keep the user's value if provided. If empty, set to "Unknown".
        
        ### 4. OUTPUT FORMAT
        Return ONLY valid JSON with no markdown formatting. Structure:
        {
          "finalDepartment": "String",
          "finalPriority": "String",
          "finalDescription": "String",
          "confidenceScore": Number (0-1)
        }
        """;


    private String generatePrompt(Report r) {
        List<String> validDepartments = List.of(
                "Roads & Transport",
                "Water Supply & Sewage",
                "Electricity & Power",
                "Sanitation & Waste",
                "Public Parks & Forestry",
                "Street Lighting"
        );

        String safeSince = (r.getIssueSince() != null) ? r.getIssueSince().toString() : "Not specified";
        String safeDesc = (r.getDescription() != null) ? r.getDescription() : "";
        // Check if Department object is null before accessing getName()
        String safeDept = (r.getDepartment() != null) ? r.getDepartment().getName() : "Not Specified";
        String safePrio = "1"; // Default or fetch from report if available
        String deptListString = String.join(", ", validDepartments);

        return String.format(promptTemplate,
                safeSince,
                safeDesc,
                safeDept,
                safePrio,
                deptListString
        );
    }


    public ClassificationDetailsDto update(Report r) {
        try {
            String instructions = generatePrompt(r);
            logger.info(instructions);
            ClassificationDetailsDto c = chatClient.prompt()
                    .user(u -> {
                        // A. Add the text prompt first
                        u.text(instructions);

                        // B. Loop through all photo URLs in the report
                        // Assuming r.getPhotoUrls() returns a List<String>
                        if (r.getMedia_url() != null) {
                            for (String urlString : r.getMedia_url()) {
                                try {
                                    URL url = new URL(urlString);
                                    // Attach each image as a separate media part
                                    u.media(MimeTypeUtils.IMAGE_JPEG, url);
                                } catch (MalformedURLException e) {
                                    // Log error or skip bad URLs
                                    System.err.println("Skipping invalid URL: " + urlString);
                                }
                            }
                        }
                    })
                    .call()
                    .entity(ClassificationDetailsDto.class);

            logger.info("dep:" + c.getFinalDepartment() + "\ndesc:" + c.getFinalDescription() + "\nprior:" + c.getFinalPriority() + "\nconfidenceScore:" + c.getConfidenceScore());
            return c;

        } catch (Exception e) {
            throw new RuntimeException("AI Processing Failed: " + e.getMessage());
        }
    }
}



