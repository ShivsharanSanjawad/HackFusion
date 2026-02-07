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
        // 1. Fetch the operator - MUST NOT BE NULL
        Operators operator = operatorsRepository.findByUsername(dto.getUsername());

        if (operator == null) {
            // Log this to your console to see what username actually arrived
            System.out.println("DEBUG: Looking for username: " + dto.getUsername());
            throw new RuntimeException("Operator not found with username: " + dto.getUsername());
        }

        Report report = new Report();
        report.setDescription(dto.getDescription());

        // Ensure the date format from React (YYYY-MM-DD) matches LocalDate
        report.setIssueSince((dto.getIssue_since()));

        report.setLat(dto.getLat());
        report.setLon(dto.getLon());
        report.setMedia_url(dto.getMedia_url());
        report.setEntryDate(LocalDate.now());
        report.setStatus("PENDING");
        report.setPriority(1);
        report.setUpvotes(0);

        // Set the mandatory sender
        report.setSenders(operator);

        // 3. Map Department (using the ID sent from React)
        if (dto.getDepartment_id() != null) {
            departmentRepository.findById(dto.getDepartment_id())
                    .ifPresent(report::setDepartment);
        }

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
    public List<Report> getAll()
    {
        return reportRepository.findAll();
    }
    public void assignWorker(assignDTO dto)
    {

    }
}
