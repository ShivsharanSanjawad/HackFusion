package com.shivsharan.HackFusion.Repository;

import com.shivsharan.HackFusion.Model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ReportStatusRepository extends JpaRepository<ReportStatus, UUID> {
    List<ReportStatus> findByReports_IdOrderByDateDesc(UUID reportId);
}
