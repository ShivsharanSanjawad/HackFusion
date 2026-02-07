package com.shivsharan.HackFusion.Repository;

import com.shivsharan.HackFusion.Entity.Incident;
import com.shivsharan.HackFusion.Entity.IncidentStatus;
import com.shivsharan.HackFusion.Entity.IncidentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // Find by tracking code
    Optional<Incident> findByTrackingCode(String trackingCode);

    // Find by reporter (citizen)
    List<Incident> findByReportedByOrderByCreatedAtDesc(Long reportedBy);
    Page<Incident> findByReportedBy(Long reportedBy, Pageable pageable);

    // Find by assigned field worker
    List<Incident> findByAssignedToOrderByPriorityAscCreatedAtDesc(Long assignedTo);
    Page<Incident> findByAssignedTo(Long assignedTo, Pageable pageable);

    // Find by department
    List<Incident> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    Page<Incident> findByDepartmentId(Long departmentId, Pageable pageable);

    // Find by status
    List<Incident> findByStatusOrderByCreatedAtDesc(IncidentStatus status);
    Page<Incident> findByStatus(IncidentStatus status, Pageable pageable);

    // Find by type
    List<Incident> findByTypeOrderByCreatedAtDesc(IncidentType type);

    // Find by status and department
    List<Incident> findByStatusAndDepartmentId(IncidentStatus status, Long departmentId);

    // Find by status and assigned to
    List<Incident> findByStatusAndAssignedTo(IncidentStatus status, Long assignedTo);

    // Find open incidents (multiple statuses)
    @Query("SELECT i FROM Incident i WHERE i.status IN :statuses ORDER BY i.priority ASC, i.createdAt ASC")
    List<Incident> findByStatusIn(@Param("statuses") List<IncidentStatus> statuses);

    // Find incidents in date range
    List<Incident> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Find incidents by location (for duplicate detection)
    @Query("SELECT i FROM Incident i WHERE " +
            "i.type = :type AND " +
            "i.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') AND " +
            "i.latitude BETWEEN :minLat AND :maxLat AND " +
            "i.longitude BETWEEN :minLng AND :maxLng")
    List<Incident> findNearbyIncidents(
            @Param("type") IncidentType type,
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng
    );

    // Count by status
    Long countByStatus(IncidentStatus status);

    // Count by department and status
    Long countByDepartmentIdAndStatus(Long departmentId, IncidentStatus status);

    // Average resolution time
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, i.createdAt, i.resolvedAt)) " +
            "FROM Incident i WHERE i.status = 'RESOLVED' AND i.resolvedAt IS NOT NULL " +
            "AND i.departmentId = :departmentId")
    Double calculateAverageResolutionTimeHours(@Param("departmentId") Long departmentId);

    // Count incidents by type (for statistics)
    @Query("SELECT i.type, COUNT(i) FROM Incident i GROUP BY i.type")
    List<Object[]> countByType();

    // Count incidents by status (for dashboard)
    @Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
    List<Object[]> countByStatus();

    // Get recent incidents (last 7 days)
    @Query("SELECT i FROM Incident i WHERE i.createdAt >= :since ORDER BY i.createdAt DESC")
    List<Incident> findRecentIncidents(@Param("since") LocalDateTime since);

    // Search incidents
    @Query("SELECT i FROM Incident i WHERE " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(i.trackingCode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Incident> searchIncidents(@Param("keyword") String keyword, Pageable pageable);

    // Complex filtering query
    @Query("SELECT i FROM Incident i WHERE " +
            "(:status IS NULL OR i.status = :status) AND " +
            "(:type IS NULL OR i.type = :type) AND " +
            "(:departmentId IS NULL OR i.departmentId = :departmentId) AND " +
            "(:assignedTo IS NULL OR i.assignedTo = :assignedTo) AND " +
            "(:priority IS NULL OR i.priority = :priority) AND " +
            "(:startDate IS NULL OR i.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR i.createdAt <= :endDate)")
    Page<Incident> findByFilters(
            @Param("status") IncidentStatus status,
            @Param("type") IncidentType type,
            @Param("departmentId") Long departmentId,
            @Param("assignedTo") Long assignedTo,
            @Param("priority") String priority,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}