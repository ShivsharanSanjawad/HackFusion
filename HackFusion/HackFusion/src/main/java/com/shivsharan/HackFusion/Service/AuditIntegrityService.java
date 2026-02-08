package com.shivsharan.HackFusion.Service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.shivsharan.HackFusion.Entity.AuditLog;
import com.shivsharan.HackFusion.Entity.TamperingAlert;
import com.shivsharan.HackFusion.Repository.AuditLogRepository;
import com.shivsharan.HackFusion.Repository.TamperingAlertRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service to detect tampering with audit logs
 * - Detects deletions from database
 * - Verifies integrity by checking IPFS
 * - Generates alerts if tampering detected
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditIntegrityService {

    private final AuditLogRepository auditLogRepository;
    private final TamperingAlertRepository tamperingAlertRepository;
    private final WebClient webClient;

    @Value("${pinata.gateway.url:https://gateway.pinata.cloud}")
    private String pinataGatewayUrl;

    /**
     * Called when audit log deletion is detected
     * Checks if IPFS copy still exists
     */
    public void handleAuditLogDeletion(AuditLog deletedLog) {
        try {
            log.warn("🚨🚨🚨 AUDIT LOG DELETION DETECTED! 🚨🚨🚨");
            log.warn("Deleted Audit Log ID: {}, Event ID: {}, Action: {}, Entity: {} (ID: {})", 
                deletedLog.getId(), deletedLog.getEventId(), deletedLog.getAction(), 
                deletedLog.getEntityType(), deletedLog.getEntityId());
            log.warn("Actor: {} ({}), IP: {}, Timestamp: {}",
                deletedLog.getActorUsername(), deletedLog.getActorType(),
                deletedLog.getIpAddress(), deletedLog.getTimestamp());
            
            // Check if IPFS copy exists
            if (deletedLog.getIpfsCid() != null && !deletedLog.getIpfsCid().isEmpty()) {
                boolean ipfsExists = checkIpfsIntegrity(deletedLog.getIpfsCid());
                
                if (ipfsExists) {
                    // GOOD: IPFS copy still exists
                    log.warn("✅ INTEGRITY SAFE: IPFS copy still exists at CID: {}", deletedLog.getIpfsCid());
                    log.warn("   The audit trail is preserved on immutable blockchain!");
                    generateTamperingAlert(deletedLog, "DATABASE_DELETION_DETECTED", 
                        "Audit log deleted from database but IPFS copy preserved - recovery possible");
                } else {
                    // CRITICAL: Both DB and IPFS deleted (tampering!)
                    log.error("❌ CRITICAL ALERT: Both database AND IPFS copies deleted!");
                    log.error("   This indicates potential tampering or malicious deletion attempt");
                    generateTamperingAlert(deletedLog, "TAMPERING_DETECTED_BOTH_DELETED",
                        "CRITICAL: Audit log deleted from both database and IPFS - complete erasure detected!");
                }
            } else {
                // No IPFS CID (upload may have failed)
                log.warn("⚠️  WARNING: No IPFS CID recorded for deleted audit log");
                log.warn("   Audit log was never uploaded to IPFS - blockchain backup missing");
                generateTamperingAlert(deletedLog, "DELETION_NO_IPFS_BACKUP",
                    "Audit log deleted but was never uploaded to IPFS - no immutable backup");
            }
            
        } catch (Exception e) {
            log.error("Error handling audit log deletion", e);
        }
    }

    /**
     * Verify if IPFS CID still exists and is accessible
     */
    private boolean checkIpfsIntegrity(String cid) {
        try {
            log.debug("Checking IPFS integrity for CID: {}", cid);
            
            String ipfsUrl = pinataGatewayUrl + "/ipfs/" + cid;
            
            var response = webClient.head()
                    .uri(ipfsUrl)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            
            if (response != null && response.getStatusCode() == HttpStatus.OK) {
                log.debug(" IPFS file exists and is accessible: {}", ipfsUrl);
                return true;
            }
            
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.error(" IPFS file NOT found for CID: {} - Status: 404", cid);
                return false;
            }
            log.error("Error checking IPFS integrity for CID: {}", cid, e);
        } catch (Exception e) {
            log.error("Unexpected error checking IPFS integrity", e);
        }
        
        return false;
    }

    /**
     * Generate alert/warning for tampering detection
     * Saves to database and logs details
     */
    @Transactional
    private void generateTamperingAlert(AuditLog deletedLog, String alertType, String message) {
        try {
            log.error(" TAMPER ALERT ");
            log.error("Alert Type: {}", alertType);
            log.error("Message: {}", message);
            log.error("Deleted Audit Details:");
            log.error("  - Event ID: {}", deletedLog.getEventId());
            log.error("  - Timestamp: {}", deletedLog.getTimestamp());
            log.error("  - Actor: {} ({})", deletedLog.getActorUsername(), deletedLog.getActorType());
            log.error("  - Action: {}", deletedLog.getAction());
            log.error("  - Entity: {} (ID: {})", deletedLog.getEntityType(), deletedLog.getEntityId());
            log.error("  - IP Address: {}", deletedLog.getIpAddress());
            log.error("  - IPFS CID: {}", deletedLog.getIpfsCid());
            log.error("Detection Time: {}", LocalDateTime.now());
            
            // Determine severity based on alert type
            String severity = alertType.equals("TAMPERING_DETECTED_BOTH_DELETED") ? 
                "CRITICAL" : 
                alertType.equals("DATABASE_DELETION_DETECTED") ? "HIGH" : "MEDIUM";
            
            // Safely get actor ID (handle null) - use Objects.requireNonNullElse
            final Long actorIdValue = deletedLog.getActorId() == null ? Long.valueOf(-1) : deletedLog.getActorId();
            
            // Create and save the alert
            TamperingAlert alert = TamperingAlert.builder()
                .alertType(alertType)
                .detectedAt(LocalDateTime.now())
                .deletedAuditLogId(deletedLog.getId())
                .deletedEventId(deletedLog.getEventId())
                .deletedAction(deletedLog.getAction())
                .deletedEntityType(deletedLog.getEntityType())
                .ipfsCid(deletedLog.getIpfsCid())
                .ipfsStillExists(alertType.equals("DATABASE_DELETION_DETECTED"))
                .message(message)
                .details(String.format(
                    "{\"actor_id\": %s, \"actor_username\": \"%s\", \"actor_type\": \"%s\", \"ip_address\": \"%s\"}",
                    String.valueOf(actorIdValue),
                    deletedLog.getActorUsername() != null ? deletedLog.getActorUsername() : "UNKNOWN",
                    deletedLog.getActorType() != null ? deletedLog.getActorType() : "UNKNOWN",
                    deletedLog.getIpAddress() != null ? deletedLog.getIpAddress() : "0.0.0.0"
                ))
                .status("NEW")
                .severity(severity)
                .detectedByService("AuditIntegrityService")
                .build();
            
            tamperingAlertRepository.save(alert);
            log.warn("✅ Alert saved to database with ID: {}", alert.getId());
            
            // TODO: Send notifications
            // - Email to admin@hackfusion.com
            // - SMS to on-call staff
            // - Dashboard notification
            // - Log to external monitoring (ELK, Splunk, DataDog)
            
        } catch (Exception e) {
            log.error("Error generating tamper alert", e);
        }
    }

    /**
     * Verify integrity of specific audit log
     * Returns true if:
     * - Database record exists AND IPFS exists, OR
     * - Using redundancy/backup
     */
    public boolean verifyAuditLogIntegrity(Long auditLogId) {
        try {
            var auditLog = auditLogRepository.findById(auditLogId);
            
            if (auditLog.isEmpty()) {
                log.error("Audit log {} not found in database!", auditLogId);
                return false;
            }
            
            AuditLog auditLogEntity = auditLog.get();
            
            // Check IPFS
            if (auditLogEntity.getIpfsCid() != null && !auditLogEntity.getIpfsCid().isEmpty()) {
                boolean ipfsOk = checkIpfsIntegrity(auditLogEntity.getIpfsCid());
                if (ipfsOk) {
                    log.debug(" Integrity OK: DB AND IPFS both exist for audit log {}", auditLogId);
                    return true;
                } else {
                    log.error(" Integrity FAILED: DB exists but IPFS missing for audit log {}", auditLogId);
                    generateTamperingAlert(auditLogEntity, "IPFS_MISSING_DB_EXISTS",
                        "Audit log exists in database but IPFS copy is missing!");
                    return false;
                }
            } else {
                log.warn(" Audit log {} exists in DB but has no IPFS backup", auditLogId);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error verifying integrity for audit log {}", auditLogId, e);
            return false;
        }
    }

    /**
     * Bulk integrity check - runs as scheduled task every hour
     * Verifies all recent audit logs have IPFS backups
     */
    @Scheduled(fixedRate = 3600000) // Run every hour (3600000 ms)
    @Transactional
    public void performScheduledIntegrityCheck() {
        try {
            log.info("🔍 Starting scheduled audit integrity check at {}", LocalDateTime.now());
            performIntegrityCheck();
        } catch (Exception e) {
            log.error("Error during scheduled integrity check", e);
        }
    }

    /**
     * Bulk integrity check implementation
     * Verifies all recent audit logs have IPFS backups
     */
    @Transactional
    public void performIntegrityCheck() {
        try {
            log.info("🔍 Starting bulk audit integrity check...");
            
            // Get all audit logs from database
            var recentLogs = auditLogRepository.findAll();
            
            // Detect missing audit logs by ID gaps
            detectMissingAuditLogs(recentLogs);
            
            // Check for recently deleted logs (from tampering_alerts table)
            var recentDeletions = tamperingAlertRepository.findByStatus("NEW");
            var deletionCount = recentDeletions.stream()
                .filter(alert -> alert.getAlertType().contains("DELETION"))
                .count();
            
            if (deletionCount > 0) {
                log.warn("⚠️  Found {} recently deleted audit logs in tampering_alerts table", deletionCount);
                recentDeletions.forEach(alert -> {
                    if (alert.getAlertType().contains("DELETION")) {
                        log.warn("   🗑️  Deleted Log ID: {}, Event: {}, Action: {}, Alert Type: {}",
                            alert.getDeletedAuditLogId(), alert.getDeletedEventId(),
                            alert.getDeletedAction(), alert.getAlertType());
                    }
                });
            }
            
            int totalChecked = 0;
            int failedChecks = 0;
            
            for (AuditLog auditLogItem : recentLogs) {
                totalChecked++;
                if (!verifyAuditLogIntegrity(auditLogItem.getId())) {
                    failedChecks++;
                }
            }
            
            log.info("═════════════════════════════════════════════════════════════");
            log.info("✅ INTEGRITY CHECK SUMMARY:");
            log.info("   Total audit logs in database: {}", totalChecked);
            log.info("   Logs with complete integrity: {}", totalChecked - failedChecks);
            log.info("   Logs with missing IPFS backup: {}", failedChecks);
            log.info("   Recently deleted logs detected: {}", deletionCount);
            log.info("═════════════════════════════════════════════════════════════");
            
            if (failedChecks > 0) {
                log.warn("⚠️  {} audit logs failed integrity check (no IPFS backup)", failedChecks);
            }
            
            if (deletionCount > 0) {
                log.warn("🚨 WARNING: {} deleted audit logs detected - check tampering_alerts table", deletionCount);
            }
            
        } catch (Exception e) {
            log.error("Error during bulk integrity check", e);
        }
    }
    
    /**
     * Detect missing audit logs by checking for gaps in ID sequence
     * This catches deletions done via raw SQL that bypass JPA listeners
     */
    @Transactional(readOnly = true)
    private void detectMissingAuditLogs(java.util.List<AuditLog> existingLogs) {
        try {
            if (existingLogs.isEmpty()) {
                log.info("📊 No audit logs in database to check for gaps");
                return;
            }
            
            // Get IDs of existing logs
            var existingIds = existingLogs.stream()
                .map(AuditLog::getId)
                .sorted()
                .toList();
            
            log.debug("📊 Existing audit log IDs: {}", existingIds);
            
            Long maxId = existingIds.get(existingIds.size() - 1);
            java.util.List<Long> missingIds = new java.util.ArrayList<>();
            
            // Find gaps in sequence
            for (long i = 1; i <= maxId; i++) {
                final long checkId = i;
                if (existingIds.stream().noneMatch(id -> id == checkId)) {
                    missingIds.add(checkId);
                }
            }
            
            if (!missingIds.isEmpty()) {
                log.warn("🗑️  DETECTED MISSING AUDIT LOGS (possible deletions): {}", missingIds);
                log.warn("   These log IDs no longer exist in database but should have been tracked as deleted");
                
                // Create TamperingAlert for each missing ID (SQL deletion detection)
                missingIds.forEach(missingId -> {
                    log.warn("   ⚠️  Missing audit log ID: {}", missingId);
                    
                    // Check if alert already exists for this missing ID
                    var existingAlerts = tamperingAlertRepository.findByDeletedAuditLogId(missingId);
                    if (existingAlerts.isEmpty()) {
                        // Create new alert for this gap-detected deletion
                        TamperingAlert alert = new TamperingAlert();
                        alert.setAlertType("DATABASE_DELETION_DETECTED_VIA_GAP");
                        alert.setSeverity("HIGH");
                        alert.setStatus("NEW");
                        alert.setDeletedAuditLogId(missingId);
                        alert.setDeletedEventId("UNKNOWN (SQL deletion - no JPA listener)");
                        alert.setDeletedAction("UNKNOWN");
                        alert.setDeletedEntityType("UNKNOWN");
                        alert.setIpfsStillExists(false); // Unknown, assume false for deleted logs
                        alert.setDetectedAt(LocalDateTime.now());
                        alert.setMessage("Audit log deleted via raw SQL (gap detection)");
                        alert.setDetails("{\"detectionMethod\":\"ID_GAP_ANALYSIS\",\"deletedVia\":\"raw_sql\",\"bypassedJpaListener\":true}");
                        
                        tamperingAlertRepository.save(alert);
                        log.info("🚨 Created TamperingAlert for gap-detected deletion ID: {}", missingId);
                    }
                });
            } else {
                log.debug("✅ No gaps detected in audit log ID sequence");
            }
            
        } catch (Exception e) {
            log.error("Error detecting missing audit logs", e);
        }
    }
    
    /**
     * Get count of critical tampering alerts
     */
    public long getCriticalAlertCount() {
        return tamperingAlertRepository.countCriticalAlerts();
    }
    
    /**
     * Get all unreviewed tampering alerts
     */
    public java.util.List<TamperingAlert> getNewAlerts() {
        return tamperingAlertRepository.findByStatus("NEW");
    }
    
    /**
     * Get all critical & high severity tampering alerts
     */
    public java.util.List<TamperingAlert> getCriticalAlerts() {
        return tamperingAlertRepository.findCriticalAlerts();
    }
    
    /**
     * Get all alerts where both DB and IPFS were deleted (most critical)
     */
    public java.util.List<TamperingAlert> getBothDeletedAlerts() {
        return tamperingAlertRepository.findBothDeletedAlerts();
    }
    
    /**
     * Acknowledge/review a tampering alert
     */
    @Transactional
    public void acknowledgeTamperingAlert(Long alertId, String userId, String username) {
        try {
            var alert = tamperingAlertRepository.findById(alertId);
            if (alert.isPresent()) {
                TamperingAlert tamperingAlert = alert.get();
                tamperingAlert.setStatus("IN_REVIEW");
                tamperingAlert.setAcknowledgedAt(LocalDateTime.now());
                tamperingAlert.setAcknowledgedByUserId(userId);
                tamperingAlert.setAcknowledgedByUsername(username);
                tamperingAlertRepository.save(tamperingAlert);
                log.info(" Tampering alert {} acknowledged by {}", alertId, username);
            }
        } catch (Exception e) {
            log.error("Error acknowledging tampering alert", e);
        }
    }
}
