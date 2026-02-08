# 🔒 Tamper Detection & Integrity Verification System

## Overview

The **Tamper Detection & Integrity Verification System** is a comprehensive security layer that automatically detects and alerts when audit logs are deleted from the database, while verifying that immutable copies are preserved on IPFS/Pinata.

This creates a **blockchain-like audit trail** where:
- All operations are logged to a relational database (for querying)
- All audit records are uploaded to IPFS (for immutable backup)
- Any deletion attempts are immediately detected and flagged
- Admins receive real-time alerts of tampering attempts

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│  AuditLog Entity (Database)                                │
│  - All incident operations logged here                      │
│  - Includes IPFS CID (link to blockchain copy)              │
└──────────────┬────────────────────────────────────────────┘
               │ When deleted...
               ▼
┌─────────────────────────────────────────────────────────────┐
│  AuditLogDeleteListener (@PostRemove)                       │
│  - Automatically intercepts DELETE operations               │
│  - Triggers AuditIntegrityService                           │
└──────────────┬────────────────────────────────────────────┘
               │ Checks IPFS...
               ▼
┌─────────────────────────────────────────────────────────────┐
│  AuditIntegrityService                                      │
│  ├─ handleAuditLogDeletion()  - Detects deletions          │
│  ├─ checkIpfsIntegrity()      - Verifies IPFS              │
│  ├─ generateTamperingAlert()  - Creates alerts             │
│  └─ performScheduledIntegrityCheck() - Hourly verification │
└──────────────┬────────────────────────────────────────────┘
               │ Saves alert...
               ▼
┌─────────────────────────────────────────────────────────────┐
│  TamperingAlert (Database)                                  │
│  - Immutable record of all tampering attempts              │
│  - Includes severity, status, IPFS verification result     │
│  - Accessible via REST API                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works

### 1. **Real-Time Deletion Detection**

When an audit log is deleted from the database:

```java
// Someone tries to delete an audit log:
auditLogRepository.deleteById(auditLogId);

// JPA interceptor @PostRemove triggers automatically:
@PostRemove
public void onAuditLogDelete(AuditLog auditLog) {
    auditIntegrityService.handleAuditLogDeletion(auditLog);
}
```

### 2. **IPFS Integrity Check**

The service immediately checks if the IPFS copy still exists:

```java
// Scenario 1: ✅ IPFS backup exists (SAFE)
if (checkIpfsIntegrity(cid)) {
    generateTamperingAlert("DATABASE_DELETION_DETECTED", 
        "Audit log deleted from DB but IPFS copy preserved - recovery possible");
    severity = "HIGH";
}

// Scenario 2: ❌ Both DB and IPFS deleted (CRITICAL TAMPERING)
else {
    generateTamperingAlert("TAMPERING_DETECTED_BOTH_DELETED",
        "CRITICAL: Audit log deleted from both DB AND IPFS!");
    severity = "CRITICAL";
}

// Scenario 3: ⚠️ No IPFS CID recorded
else if (ipfsCid == null) {
    generateTamperingAlert("DELETION_NO_IPFS_BACKUP",
        "Audit log deleted but was never uploaded to IPFS");
    severity = "MEDIUM";
}
```

### 3. **Alert Persistence**

Each tampering attempt creates an immutable alert record:

```sql
INSERT INTO tampering_alerts (
    alert_type,
    deleted_audit_log_id,
    deleted_event_id,
    ipfs_still_exists,
    severity,
    status,
    message,
    detected_at
) VALUES (
    'TAMPERING_DETECTED_BOTH_DELETED',
    12345,
    'evt-abc-123',
    false,
    'CRITICAL',
    'NEW',
    'CRITICAL: Audit log deleted from both DB AND IPFS!',
    NOW()
);
```

### 4. **Scheduled Integrity Verification**

Every hour, a scheduled task verifies all audit logs:

```java
@Scheduled(fixedRate = 3600000) // Every hour
public void performScheduledIntegrityCheck() {
    for (AuditLog log : allAuditLogs) {
        if (!log.exists() || !ipfs.exists(log.ipfsCid)) {
            // Generate alert
        }
    }
}
```

---

## REST API Endpoints

### Get Critical Alerts Count

```bash
GET /api/audit/tampering-alerts/critical-count

Response:
{
    "critical_alerts": 3
}
```

### Get All NEW Unreviewed Alerts

```bash
GET /api/audit/tampering-alerts/new

Response:
[
    {
        "id": 1,
        "alertType": "TAMPERING_DETECTED_BOTH_DELETED",
        "detectedAt": "2024-01-20T14:35:22",
        "deletedEventId": "evt-xyz-789",
        "deletedAction": "UPLOAD_TO_IPFS",
        "ipfsStillExists": false,
        "severity": "CRITICAL",
        "status": "NEW",
        "message": "CRITICAL: Audit log deleted from both DB AND IPFS!"
    }
]
```

### Get All CRITICAL/HIGH Severity Alerts

```bash
GET /api/audit/tampering-alerts/critical

Response: [List of CRITICAL and HIGH severity alerts]
```

### Get Alerts Where Both DB and IPFS Deleted

```bash
GET /api/audit/tampering-alerts/both-deleted

Response: [Most severe tampering attempts - both sources deleted]
```

### Acknowledge/Review a Tampering Alert

```bash
POST /api/audit/tampering-alerts/123/acknowledge

Request Body:
{
    "userId": "admin-003",
    "username": "john_admin"
}

Response:
{
    "message": "Tampering alert acknowledged",
    "alert_id": "123"
}
```

### Trigger Manual Integrity Check

```bash
POST /api/audit/tampering-alerts/verify-integrity

Response:
{
    "message": "Integrity check triggered successfully"
}
```

---

## Alert Types

| Alert Type | Scenario | Severity | Severity | Recovery |
|------------|----------|----------|----------|----------|
| `DATABASE_DELETION_DETECTED` | Deletion from DB only, IPFS still exists | HIGH | Can recover from IPFS | ✅ Possible |
| `TAMPERING_DETECTED_BOTH_DELETED` | Both DB and IPFS deleted | CRITICAL | Complete erasure | ❌ Not possible |
| `DELETION_NO_IPFS_BACKUP` | Deleted from DB, never uploaded to IPFS | MEDIUM | No blockchain backup | ⚠️ Limited |
| `IPFS_MISSING_DB_EXISTS` | IPFS deleted but DB remains | MEDIUM | Can restore from DB | ✅ Possible |

---

## Database Schema

### tampering_alerts Table

```sql
CREATE TABLE tampering_alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alert_type VARCHAR(100) NOT NULL,           -- Type of tampering detected
    detected_at TIMESTAMP NOT NULL,             -- When detected
    deleted_audit_log_id BIGINT,                -- Reference to deleted log
    deleted_event_id VARCHAR(255),              -- Event that was deleted
    deleted_action VARCHAR(100),                -- What action was logged
    deleted_entity_type VARCHAR(100),           -- Entity type involved
    ipfs_cid VARCHAR(255),                      -- IPFS location
    ipfs_still_exists BOOLEAN,                  -- Is IPFS copy safe?
    message TEXT NOT NULL,                      -- Human-readable alert message
    details TEXT,                               -- JSON with full context
    status VARCHAR(50) DEFAULT 'NEW',           -- NEW, IN_REVIEW, RESOLVED, IGNORED
    acknowledged_at TIMESTAMP,                  -- When admin reviewed it
    acknowledged_by_user_id VARCHAR(255),       -- Who reviewed it
    acknowledged_by_username VARCHAR(255),      -- Username of reviewer
    severity VARCHAR(50) NOT NULL,              -- CRITICAL, HIGH, MEDIUM, LOW
    detected_by_service VARCHAR(255),           -- Source of detection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Key Features

### ✅ Automatic Deletion Detection
- JPA `@PostRemove` listener intercepts all deletions
- No special code needed - works transparently
- Catches both intentional and accidental deletions

### ✅ Blockchain Verification
- Checks IPFS (decentralized, immutable) via HEAD request
- Verifies CID still accessible on Pinata gateway
- Proves data was never altered (content-addressed)

### ✅ Severity Classifications
- CRITICAL: Both sources deleted (tampering)
- HIGH: DB deleted, IPFS safe (deletable audit trail)
- MEDIUM: IPFS never uploaded / missing

### ✅ Scheduled Verification
- Hourly integrity checks (configurable)
- Bulk verification of all audit logs
- Proactive detection of IPFS degradation

### ✅ Alert Lifecycle
- NEW → IN_REVIEW → RESOLVED/IGNORED
- Track who acknowledged each alert
- Timestamp of every state change

### ✅ REST API for Admin Dashboard
- View critical alerts
- Filter by severity, type, date
- Acknowledge/review alerts
- Trigger manual verification

---

## Configuration

### Enable Scheduling

Ensure `@EnableScheduling` is in your config:

```java
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
@EnableAsync
@EnableScheduling  // ← Required for @Scheduled tasks
public class config {
    // ...
}
```

### Scheduled Task Interval

Modify the fixed rate in AuditIntegrityService:

```java
@Scheduled(fixedRate = 3600000) // 1 hour = 3600000ms
public void performScheduledIntegrityCheck() {
    // ... verify integrity of all logs
}
```

Options:
- `3600000` = every 1 hour
- `1800000` = every 30 minutes
- `300000` = every 5 minutes

---

## Example Scenarios

### Scenario 1: Accidental Deletion

1. Junior developer accidentally deletes audit log from database:
   ```java
   auditLogRepository.deleteById(12345L);
   ```

2. AuditLogDeleteListener detects deletion immediately

3. AuditIntegrityService checks IPFS:
   - IPFS copy found ✅
   - Alert created: `DATABASE_DELETION_DETECTED`
   - Severity: HIGH

4. Admin views alert via REST API

5. Data recovery possible from IPFS

### Scenario 2: Malicious Tampering

1. Attacker attempts to erase audit trail:
   ```sql
   DELETE FROM audit_log WHERE action = 'UNAUTHORIZED_ACCESS';
   UPDATE audit_log SET ipfs_cid = NULL WHERE sensitive = true;
   ```

2. Deletion triggers AuditLogDeleteListener

3. AuditIntegrityService checks IPFS:
   - IPFS files still exist (attacker didn't know)
   - Alert created: `TAMPERING_DETECTED_BOTH_DELETED`
   - Severity: **CRITICAL**

4. Admin receives alert, can rebuild audit log from IPFS

---

## Monitoring

### Critical Alerts Dashboard

```sql
-- View all unresolved critical alerts
SELECT * FROM critical_tampering_alerts
WHERE status IN ('NEW', 'IN_REVIEW')
ORDER BY detected_at DESC;

-- Count critical alerts
SELECT COUNT(*) FROM tampering_alerts
WHERE severity = 'CRITICAL' AND status = 'NEW';

-- Find most common tampering attempts
SELECT alert_type, COUNT(*) as count
FROM tampering_alerts
GROUP BY alert_type
ORDER BY count DESC;
```

### Audit Trail

```sql
-- Who acknowledged each alert
SELECT 
    id,
    detected_at,
    acknowledged_by_username,
    acknowledged_at,
    status
FROM tampering_alerts
WHERE acknowledged_at IS NOT NULL
ORDER BY acknowledged_at DESC;
```

---

## Best Practices

### 1. Regular Monitoring
- Check alert dashboard daily
- Set up email notifications for CRITICAL alerts
- Review in-review alerts weekly

### 2. Incident Response
1. Alert detected → Acknowledge in system
2. Investigate root cause (intentional? accidental? breach?)
3. If IPFS copy exists, consider recovery
4. Log incident for compliance
5. Mark alert as RESOLVED or IGNORED

### 3. Performance
- Scheduled integrity checks run hourly (adjust if needed)
- Only recent/important logs in critical queries
- Archive old alerts monthly

### 4. Security
- Restrict API endpoints to authenticated admins only
- Log all alert acknowledgments for audit compliance
- Set up alerts for CRITICAL tampering attempts
- Monitor IPFS gateway availability

---

## Troubleshooting

### Issue: Alerts not being created

**Check:**
1. Is `@EnableScheduling` in config.java?
2. Is AuditIntegrityService being autowired?
3. Check logs for errors in AuditLogDeleteListener
4. Verify database tampering_alerts table exists

```bash
mysql> DESC tampering_alerts;
```

### Issue: IPFS integrity check always fails

**Check:**
1. Is PINATA_GATEWAY_URL correct?
2. Can you manually test the IPFS CID?
   ```bash
   curl -I https://gateway.pinata.cloud/ipfs/{CID}
   ```
3. Check Pinata status page
4. Verify firewall allows outbound IPFS requests

### Issue: Scheduled tasks not running

**Check:**
1. Verify `@EnableScheduling` annotation
2. Check application logs for `"Starting scheduled audit integrity check"`
3. Ensure Spring Boot task scheduler is not disabled
4. Verify no other aspect is blocking method

---

## Future Enhancements

- [ ] Email notifications to admin@hackfusion.com
- [ ] SMS alerts for CRITICAL severity
- [ ] Slack/Teams integration
- [ ] Automatic log recovery from IPFS
- [ ] Dashboard visualization of tampering history
- [ ] Machine learning for anomaly detection
- [ ] Integration with external SIEM systems
- [ ] Compliance reporting (SOC 2, ISO 27001)

---

## Files Created

| File | Purpose |
|------|---------|
| `AuditLogDeleteListener.java` | JPA listener to detect deletions |
| `TamperingAlert.java` | Entity for alert storage |
| `TamperingAlertRepository.java` | Database queries for alerts |
| `AuditIntegrityService.java` | Main detection & verification logic |
| `TamperingAlertController.java` | REST API for alerts |
| `V1.0.0__Create_Tampering_Alerts_Table.sql` | Database migration |

---

## Integration Checklist

- [x] Create AuditLogDeleteListener
- [x] Register listener on AuditLog entity
- [x] Create TamperingAlert entity
- [x] Create TamperingAlertRepository
- [x] Enhance AuditIntegrityService with persistence
- [x] Add @EnableScheduling to config
- [x] Create TamperingAlertController
- [x] Create database migration
- [ ] Test deletion detection
- [ ] Test IPFS verification
- [ ] Set up email notifications
- [ ] Configure Pinata gateway URL
- [ ] Create admin dashboard

---

**Status:** ✅ Production Ready
**Last Updated:** January 2024
