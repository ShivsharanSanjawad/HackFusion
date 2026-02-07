package com.shivsharan.HackFusion.Service;

import java.time.LocalDateTime;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shivsharan.HackFusion.Entity.AuditLog;
import com.shivsharan.HackFusion.Repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class IpfsAuditService {

    private final PinataService pinataService;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Upload audit log to IPFS asynchronously
     * This runs in a separate thread and should not block the main request
     */
    @Async
    public void uploadToIpfsAsync(AuditLog auditLog) {
        try {
            log.info("==== IPFS UPLOAD START ====");
            log.info("Uploading audit log ID: {} (EventID: {})", auditLog.getId(), auditLog.getEventId());
            log.info("Action: {}, Entity: {}", auditLog.getAction(), auditLog.getEntityType());

            // Convert audit log to JSON
            String jsonContent = objectMapper.writeValueAsString(auditLog);
            log.debug("JSON content size: {} bytes", jsonContent.length());

            // Create a resource from JSON string
            ByteArrayResource resource = new ByteArrayResource(
                    jsonContent.getBytes()
            ) {
                @Override
                public String getFilename() {
                    return "audit_" + auditLog.getEventId() + ".json";
                }
            };

            log.info("Sending to Pinata with filename: {}", resource.getFilename());

            // Upload to Pinata
            String cid = pinataService.uploadFileToIpfs(resource);

            log.info("Received CID from Pinata: {}", cid);

            // Update database with CID
            updateIpfsStatus(auditLog.getId(), cid, "SUCCESS");

            log.info("==== IPFS UPLOAD SUCCESS ====");
            log.info("Audit log {} successfully uploaded to IPFS with CID: {}", 
                    auditLog.getId(), cid);

        } catch (Exception e) {
            log.error("==== IPFS UPLOAD FAILED ====", e);
            log.error("Error uploading audit log {} to IPFS", auditLog.getId());
            log.error("Exception type: {}", e.getClass().getSimpleName());
            log.error("Error message: {}", e.getMessage());
            
            updateIpfsStatus(auditLog.getId(), null, "FAILED");
        }
    }

    /**
     * Update IPFS status - simplified approach using find-update-save
     * No @Modifying query needed - just fetch, update, and save
     * Works reliably with async operations
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void updateIpfsStatus(Long auditLogId, String cid, String status) {
        try {
            // Find the audit log
            var auditLogOptional = auditLogRepository.findById(auditLogId);
            
            if (auditLogOptional.isPresent()) {
                // Update fields
                AuditLog auditLogEntity = auditLogOptional.get();
                auditLogEntity.setIpfsCid(cid);
                auditLogEntity.setIpfsUploadStatus(status);
                auditLogEntity.setIpfsUploadedAt(LocalDateTime.now());
                
                // Save updated entity
                auditLogRepository.save(auditLogEntity);
                
                log.debug("Updated IPFS status for audit log {}: {} - CID: {}", 
                        auditLogId, status, cid);
            } else {
                log.warn("Audit log {} not found for IPFS status update", auditLogId);
            }
        } catch (Exception e) {
            log.error("Failed to update IPFS status for audit log {}", auditLogId, e);
        }
    }
}