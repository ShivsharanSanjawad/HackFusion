package com.shivsharan.HackFusion.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PinataService {

    @Value("${pinata.api.url}")
    private String pinataUrl;

    @Value("${pinata.api.jwt:#{null}}")
    private String jwt;

    private final WebClient webClient;

    public PinataService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String uploadFileToIpfs(Resource fileResource) {
        try {
            // Validate JWT token
            if (jwt == null || jwt.isEmpty() || jwt.equals("null")) {
                log.error("PINATA_JWT environment variable not set or empty!");
                throw new RuntimeException("Pinata JWT token not configured. Set PINATA_JWT environment variable.");
            }

            log.info("Uploading file to Pinata: {}", fileResource.getFilename());
            log.debug("Pinata URL: {}", pinataUrl);
            log.debug("JWT Token configured: {}", !jwt.isEmpty());

            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", fileResource);

            String response = webClient.post()
                    .uri(pinataUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Pinata response: {}", response);

            // Extract CID from response JSON
            // Pinata returns: {"IpfsHash":"QmXXX","PinSize":123,"Timestamp":"2024-01-01T..."}
            String cid = extractCidFromResponse(response);
            
            if (cid != null && !cid.isEmpty()) {
                log.info("Successfully got CID from Pinata: {}", cid);
                return cid;
            } else {
                log.error("Could not extract CID from Pinata response: {}", response);
                throw new RuntimeException("Failed to extract CID from Pinata response");
            }

        } catch (WebClientResponseException e) {
            log.error("Pinata API error - Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Pinata upload failed: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Error uploading to Pinata", e);
            throw new RuntimeException("Failed to upload to Pinata", e);
        }
    }

    private String extractCidFromResponse(String response) {
        try {
            // Use Jackson for proper JSON parsing
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            
            // Pinata returns IpfsHash in the response
            JsonNode ipfsHashNode = root.get("IpfsHash");
            
            if (ipfsHashNode != null && ipfsHashNode.isTextual()) {
                String cid = ipfsHashNode.asText();
                log.debug("Extracted CID: {}", cid);
                return cid;
            }
            
            log.warn("IpfsHash field not found or not a string in Pinata response: {}", response);
            return null;
            
        } catch (Exception e) {
            log.error("Error parsing CID from Pinata response: {}", response, e);
            return null;
        }
    }
}

