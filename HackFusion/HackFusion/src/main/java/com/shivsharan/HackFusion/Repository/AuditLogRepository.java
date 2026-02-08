package com.shivsharan.HackFusion.Repository;

import com.shivsharan.HackFusion.Entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Optional<AuditLog> findTopByOrderByIdDesc();

    // Special update for IPFS fields only (exception to immutability)
    @Modifying
    @Query("UPDATE AuditLog a SET a.ipfsCid = :cid, " +
            "a.ipfsUploadStatus = :status, " +
            "a.ipfsUploadedAt = :uploadedAt " +
            "WHERE a.id = :id")
    void updateIpfsInfo(@Param("id") Long id,
                        @Param("cid") String cid,
                        @Param("status") String status,
                        @Param("uploadedAt") LocalDateTime uploadedAt);
}