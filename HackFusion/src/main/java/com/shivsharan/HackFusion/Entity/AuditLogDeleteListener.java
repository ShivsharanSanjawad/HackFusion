package com.shivsharan.HackFusion.Entity;

import com.shivsharan.HackFusion.Service.AuditIntegrityService;
import jakarta.persistence.PostRemove;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * JPA Entity Listener to detect AuditLog deletions
 * Automatically called when an AuditLog is deleted from database
 * Checks IPFS for integrity
 */
@Component
@Slf4j
public class AuditLogDeleteListener {

    private static AuditIntegrityService auditIntegrityService;

    @Autowired
    public void setAuditIntegrityService(AuditIntegrityService service) {
        AuditLogDeleteListener.auditIntegrityService = service;
    }

    /**
     * Called AFTER an AuditLog is deleted from database
     * Triggers integrity verification
     */
    @PostRemove
    public void onAuditLogDelete(AuditLog auditLog) {
        log.warn("🚨 AUDIT LOG DELETION INTERCEPTED!");
        log.warn("Deleted audit log: ID={}, EventID={}, Action={}", 
            auditLog.getId(), auditLog.getEventId(), auditLog.getAction());
        
        if (auditIntegrityService != null) {
            // Check if IPFS backup still exists
            auditIntegrityService.handleAuditLogDeletion(auditLog);
        } else {
            log.error("❌ AuditIntegrityService not initialized - cannot verify IPFS!");
        }
    }
}
