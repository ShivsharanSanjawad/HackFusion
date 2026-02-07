package com.shivsharan.HackFusion.Controller;

import com.shivsharan.HackFusion.Entity.TamperingAlert;
import com.shivsharan.HackFusion.Service.AuditIntegrityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing und reviewing tampering alerts
 * Admins can view critical alerts and acknowledge detected tampering attempts
 */
@RestController
@RequestMapping("/api/audit/tampering-alerts")
@RequiredArgsConstructor
@Slf4j
public class TamperingAlertController {

    private final AuditIntegrityService auditIntegrityService;

    /**
     * Get count of critical alerts (most urgent)
     * GET /api/audit/tampering-alerts/critical-count
     */
    @GetMapping("/critical-count")
    public ResponseEntity<Map<String, Long>> getCriticalAlertCount() {
        Long count = auditIntegrityService.getCriticalAlertCount();
        Map<String, Long> response = new HashMap<>();
        response.put("critical_alerts", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all NEW unreviewed alerts
     * GET /api/audit/tampering-alerts/new
     */
    @GetMapping("/new")
    public ResponseEntity<List<TamperingAlert>> getNewAlerts() {
        List<TamperingAlert> alerts = auditIntegrityService.getNewAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get all CRITICAL and HIGH severity alerts
     * GET /api/audit/tampering-alerts/critical
     */
    @GetMapping("/critical")
    public ResponseEntity<List<TamperingAlert>> getCriticalAlerts() {
        List<TamperingAlert> alerts = auditIntegrityService.getCriticalAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get all alerts where BOTH DB AND IPFS were deleted (most severe tampering)
     * GET /api/audit/tampering-alerts/both-deleted
     */
    @GetMapping("/both-deleted")
    public ResponseEntity<List<TamperingAlert>> getBothDeletedAlerts() {
        List<TamperingAlert> alerts = auditIntegrityService.getBothDeletedAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Acknowledge/review a tampering alert
     * POST /api/audit/tampering-alerts/{alertId}/acknowledge
     * Body: { "userId": "user123", "username": "admin" }
     */
    @PostMapping("/{alertId}/acknowledge")
    public ResponseEntity<Map<String, String>> acknowledgeTamperingAlert(
            @PathVariable Long alertId,
            @RequestBody Map<String, String> body) {
        
        String userId = body.get("userId");
        String username = body.get("username");
        
        auditIntegrityService.acknowledgeTamperingAlert(alertId, userId, username);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Tampering alert acknowledged");
        response.put("alert_id", alertId.toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Trigger manual integrity check (in addition to automatic scheduled check)
     * POST /api/audit/tampering-alerts/verify-integrity
     */
    @PostMapping("/verify-integrity")
    public ResponseEntity<Map<String, String>> triggerIntegrityCheck() {
        try {
            auditIntegrityService.performIntegrityCheck();
            Map<String, String> response = new HashMap<>();
            response.put("message", "Integrity check triggered successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error triggering integrity check", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to trigger integrity check: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
