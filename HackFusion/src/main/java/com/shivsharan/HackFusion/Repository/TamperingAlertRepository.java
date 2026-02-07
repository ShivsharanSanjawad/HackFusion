package com.shivsharan.HackFusion.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shivsharan.HackFusion.Entity.TamperingAlert;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TamperingAlertRepository extends JpaRepository<TamperingAlert, Long> {
    
    /**
     * Find all alerts for a deleted audit log
     */
    List<TamperingAlert> findByDeletedAuditLogId(Long deletedAuditLogId);
    
    /**
     * Find all CRITICAL/HIGH severity alerts
     */
    @Query("SELECT ta FROM TamperingAlert ta WHERE ta.severity IN ('CRITICAL', 'HIGH')")
    List<TamperingAlert> findCriticalAlerts();
    
    /**
     * Find all NEW unreviewed alerts
     */
    List<TamperingAlert> findByStatus(String status);
    
    /**
     * Find alerts detected within time range
     */
    @Query("SELECT ta FROM TamperingAlert ta WHERE ta.detectedAt BETWEEN :start AND :end")
    List<TamperingAlert> findAlertsInTimeRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    /**
     * Find alerts for specific event
     */
    Optional<TamperingAlert> findByDeletedEventId(String eventId);
    
    /**
     * Count CRITICAL alerts
     */
    @Query("SELECT COUNT(ta) FROM TamperingAlert ta WHERE ta.severity = 'CRITICAL'")
    long countCriticalAlerts();
    
    /**
     * Find all alerts with both DB and IPFS deleted (most critical)
     */
    @Query("SELECT ta FROM TamperingAlert ta WHERE ta.alertType = 'TAMPERING_DETECTED_BOTH_DELETED'")
    List<TamperingAlert> findBothDeletedAlerts();
}
