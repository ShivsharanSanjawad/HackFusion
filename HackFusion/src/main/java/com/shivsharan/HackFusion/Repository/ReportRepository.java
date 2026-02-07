package com.shivsharan.HackFusion.Repository;

import com.shivsharan.HackFusion.Model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByOperatorId(UUID id);
    List<Report> findByStatus(String status);
}
