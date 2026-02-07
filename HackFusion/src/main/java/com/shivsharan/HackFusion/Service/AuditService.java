package com.shivsharan.HackFusion.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.stereotype.Service;

import com.shivsharan.HackFusion.DTO.AuditEvent;
import com.shivsharan.HackFusion.Entity.AuditLog;
import com.shivsharan.HackFusion.Repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final IpfsAuditService ipfsAuditService;

    /**
     * Main method to log audit events
     * NO @Transactional - let Spring Data handle transactions implicitly
     * This prevents nested transaction conflicts when called from aspect
     * Catches exceptions to prevent breaking the main request flow
     */
    public void logEvent(AuditEvent event) {
        try {
            // Get previous checksum for chaining
            String previousChecksum = getLastChecksum();

            // Calculate current checksum
            String currentChecksum = calculateChecksum(event, previousChecksum);

            // Create audit log entity
            // Use -1 as default when entityId is null (represents "no specific entity")
            Long entityId = event.getEntityId() != null ? event.getEntityId() : -1L;
            
            AuditLog auditLog = AuditLog.builder()
                    .eventId(event.getEventId())
                    .timestamp(event.getTimestamp())
                    .actorUsername(event.getActorUsername())
                    .actorType(event.getActorType())
                    .entityType(event.getEntityType())
                    .entityId(entityId)
                    .action(event.getAction())
                    .oldState(event.getOldState())
                    .newState(event.getNewState())
                    .description(event.getDescription())
                    .ipAddress(event.getIpAddress())
                    .checksum(currentChecksum)
                    .previousChecksum(previousChecksum)
                    .ipfsUploadStatus("PENDING")
                    .build();

            if (entityId == -1L) {
                log.debug("Audit log created with default entity ID (-1) - operation may not target a specific entity");
            }

            // Save to database - Spring Data JPA handles transaction automatically
            AuditLog saved = auditLogRepository.save(auditLog);

            log.debug("Audit log saved with ID: {}, Event: {}", saved.getId(), event.getEventId());

            // Upload to IPFS asynchronously (if enabled)
            if (event.isUploadToIpfs()) {
                ipfsAuditService.uploadToIpfsAsync(saved);
            }

        } catch (Exception e) {
            log.error("Failed to log audit event", e);
            // Don't throw - audit logging shouldn't break main flow
        }
    }

    private String getLastChecksum() {
        return auditLogRepository.findTopByOrderByIdDesc()
                .map(AuditLog::getChecksum)
                .orElse("GENESIS");
    }

    private String calculateChecksum(AuditEvent event, String previousChecksum) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            String data = String.format("%s|%s|%s|%s|%s|%s",
                    previousChecksum,
                    event.getEventId(),
                    event.getTimestamp(),
                    event.getAction(),
                    event.getEntityId(),
                    event.getNewState()
            );

            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);

        } catch (Exception e) {
            throw new RuntimeException("Checksum calculation failed", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}