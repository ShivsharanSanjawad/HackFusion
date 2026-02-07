-- SQL Schema for Tampering Alerts Table
-- This table stores all detected tampering/deletion attempts on audit logs
-- Run this migration to create the tampering_alerts table

CREATE TABLE IF NOT EXISTS tampering_alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Alert Classification
    alert_type VARCHAR(100) NOT NULL,
    -- Values: 'DATABASE_DELETION_DETECTED', 'TAMPERING_DETECTED_BOTH_DELETED', 'DELETION_NO_IPFS_BACKUP', 'IPFS_MISSING_DB_EXISTS'
    
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Reference to the deleted audit log
    deleted_audit_log_id BIGINT,
    deleted_event_id VARCHAR(255),
    deleted_action VARCHAR(100),
    deleted_entity_type VARCHAR(100),
    
    -- IPFS verification status
    ipfs_cid VARCHAR(255),
    ipfs_still_exists BOOLEAN,
    
    -- Alert Details
    message TEXT NOT NULL,
    details TEXT, -- JSON with additional context
    
    -- Alert Status
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    -- Values: 'NEW', 'IN_REVIEW', 'RESOLVED', 'IGNORED'
    
    acknowledged_at TIMESTAMP,
    acknowledged_by_user_id VARCHAR(255),
    acknowledged_by_username VARCHAR(255),
    
    -- Security Context
    detected_by_service VARCHAR(255),
    severity VARCHAR(50) NOT NULL,
    -- Values: 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    
    -- Audit Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for fast queries
    INDEX idx_alert_type (alert_type),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_detected_at (detected_at),
    INDEX idx_ipfs_cid (ipfs_cid),
    INDEX idx_deleted_event_id (deleted_event_id),
    UNIQUE KEY unique_alert_deletion (deleted_audit_log_id, alert_type)
);

-- Add column to audit_log table if it doesn't already have ipfs_cid (may already exist)
ALTER TABLE IF EXISTS audit_log 
    ADD COLUMN IF NOT EXISTS ipfs_cid VARCHAR(255),
    ADD COLUMN IF NOT EXISTS ipfs_upload_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ipfs_uploaded_at TIMESTAMP;

-- Create view for critical alerts dashboard
CREATE OR REPLACE VIEW critical_tampering_alerts AS
SELECT 
    id,
    alert_type,
    detected_at,
    deleted_audit_log_id,
    deleted_event_id,
    deleted_action,
    ipfs_still_exists,
    severity,
    status,
    message
FROM tampering_alerts
WHERE severity IN ('CRITICAL', 'HIGH') AND status IN ('NEW', 'IN_REVIEW')
ORDER BY detected_at DESC;

-- Create view for all tampering (both DB and IPFS deleted)
CREATE OR REPLACE VIEW both_deleted_tampering AS
SELECT 
    id,
    detected_at,
    deleted_audit_log_id,
    deleted_event_id,
    message,
    acknowledged_at,
    acknowledged_by_username
FROM tampering_alerts
WHERE alert_type = 'TAMPERING_DETECTED_BOTH_DELETED'
ORDER BY detected_at DESC;
