package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.DTO.ReportRequest;
import com.shivsharan.HackFusion.DTO.assignDTO;
import com.shivsharan.HackFusion.Model.Department;
import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Repository.DepartmentRepository;
import com.shivsharan.HackFusion.Repository.OperatorsRepository;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import com.shivsharan.HackFusion.Repository.ReportStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {
    @Autowired
    ReportRepository reportRepository;
    @Autowired
    ReportStatusRepository reportStatusRepository;
    @Autowired
    OperatorsRepository operatorsRepository;
    @Autowired
    DepartmentRepository departmentRepository;
    public Report save(ReportRequest dto) {
        // 1. Initialize a new Report Entity
        Report report = new Report();

        // 2. Map basic fields from DTO
        report.setDescription(dto.getDescription());
        report.setIssueSince((dto.getIssue_since()));
        report.setLat(dto.getLat());
        report.setLon(dto.getLon());
        report.setMedia_url(dto.getMedia_url());

        // 3. Set default values for a new report
        report.setEntryDate(LocalDate.now());
        report.setStatus("PENDING");
        report.setPriority(1); // Default medium priority
        report.setUpvotes(0);

        Department dept = departmentRepository.findById(dto.getDepartment_id())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Operators operator = operatorsRepository.findById(dto.getUid())
                .orElseThrow(() -> new RuntimeException("Operator not found"));

        report.setDepartment(dept);
        report.setSenders(operator);

        // 5. Persist to Database
        return reportRepository.save(report);
    }
    public List<Report> getReports(UUID departmentId)
    {
        return reportRepository.findByDepartment_Id(departmentId);
    }
    public List<ReportStatus> getReportStatus(UUID reportId)
    {
        return reportStatusRepository.findByReports_IdOrderByDateDesc(reportId);
    }
    public List<Operators> getWorkers(UUID departmentId)
    {
        return operatorsRepository.findByDepartment_Id(departmentId);
    }
    public void assignWorker(assignDTO dto)
    {

    }
}
