package com.shivsharan.HackFusion.Repository;

import com.shivsharan.HackFusion.DTO.DepartmentRankDTO;
import com.shivsharan.HackFusion.DTO.OverallStatsDTO;
import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Model.Report;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    Optional<Report> findById(UUID id);
    List<Report> findByDepartment_Id(UUID departmentId);
    List<Report> findByWorkersId(UUID workerId);

    @EntityGraph(attributePaths = {"senders", "department"})
    List<Report> findBySenders_Id(UUID userId);

    List<Report> findBySenders(Operators senders);

    @Query("""
        SELECT new com.shivsharan.HackFusion.DTO.DepartmentRankDTO(
            d.id,
            d.name,
            COUNT(r),
            SUM(CASE WHEN r.status = 'RESOLVED' THEN 1 ELSE 0 END),
            SUM(CASE WHEN r.status <> 'RESOLVED' THEN 1 ELSE 0 END),
            COALESCE(AVG(
                CASE
                    WHEN r.status = 'RESOLVED' THEN 
                        (SELECT CAST(FUNCTION('TIMESTAMPDIFF', DAY, r.entryDate, MAX(rs.date)) AS double)
                         FROM ReportStatus rs 
                         WHERE rs.reports.id = r.id AND rs.status = 'RESOLVED')
                    ELSE NULL 
                END
            ), 0.0)
        )
        FROM Report r
        JOIN r.department d
        GROUP BY d.id, d.name
        ORDER BY SUM(CASE WHEN r.status = 'RESOLVED' THEN 1 ELSE 0 END) DESC
    """)
    List<DepartmentRankDTO> getDepartmentsRankWise();

    // FIXED: Attached this @Query directly to the getOverallStats method
    @Query("""
        SELECT new com.shivsharan.HackFusion.DTO.OverallStatsDTO(
            COUNT(CASE WHEN r.entryDate >= :weekStart THEN 1 ELSE 0 END),
            SUM(CASE WHEN r.status = 'RESOLVED' THEN 1 ELSE 0 END),
            SUM(CASE WHEN r.status <> 'RESOLVED' THEN 1 ELSE 0 END),
            COUNT(r),
            COALESCE(AVG(
                CASE 
                    WHEN r.status = 'RESOLVED' THEN 
                        (SELECT CAST(FUNCTION('TIMESTAMPDIFF', DAY, r.entryDate, MAX(rs.date)) AS double)
                         FROM ReportStatus rs 
                         WHERE rs.reports.id = r.id AND rs.status = 'RESOLVED')
                    ELSE NULL 
                END
            ), 0.0)
        )
        FROM Report r
    """)
    OverallStatsDTO getOverallStats(@Param("weekStart") LocalDate weekStart);

    // FIXED: This method now has exactly one @Query annotation
    @Query(value = "SELECT * FROM reports r WHERE r.department_id = :deptId AND " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(r.lat)) * " +
            "cos(radians(r.lon) - radians(:lon)) + sin(radians(:lat)) * " +
            "sin(radians(r.lat)))) <= :dist",
            nativeQuery = true)
    List<Report> findReportsWithinDistance_ByDepartment(@Param("lat") double lat,
                                           @Param("lon") double lon,
                                           @Param("dist") double dist,
                                           @Param("deptId") String depIt);

    @Query(value = "SELECT * FROM reports r WHERE " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(r.lat)) * " +
            "cos(radians(r.lon) - radians(:lon)) + sin(radians(:lat)) * " +
            "sin(radians(r.lat)))) <= :dist",
            nativeQuery = true)
    List<Report> findReportsWithinDistance(@Param("lat") double lat,
                                                        @Param("lon") double lon,
                                                        @Param("dist") double dist);

    @Query("SELECT COUNT(r.id), COUNT(DISTINCT r.category) FROM Report r WHERE r.senders.id = :userId")
    Object[] findCivicMetricsByUserId(@Param("userId") UUID userId);
}