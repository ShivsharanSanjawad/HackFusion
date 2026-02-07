package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.DTO.ReportRequest;
import com.shivsharan.HackFusion.DTO.assignDTO;
import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Repository.OperatorsRepository;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import com.shivsharan.HackFusion.Repository.ReportStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

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
    public Report save(ReportRequest dto) {
        return null;
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
