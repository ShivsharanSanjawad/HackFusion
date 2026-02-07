package com.shivsharan.HackFusion.Repository;

import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    Optional<Report> findById(UUID id);
    List<Report> findByDepartment_Id(UUID departmentId);
    List<Report> findByWorkersId(UUID workerId);
    List<Report> findBySenders_Id(UUID userId);
    List<Report> findBySenders(Operators senders);
}
