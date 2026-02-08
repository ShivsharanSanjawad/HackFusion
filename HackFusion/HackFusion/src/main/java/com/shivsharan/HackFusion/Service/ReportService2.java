package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.DTO.CompletionDTO;
import com.shivsharan.HackFusion.DTO.Status;
import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Model.ReportStatus;
import com.shivsharan.HackFusion.Repository.OperatorsRepository;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import com.shivsharan.HackFusion.Repository.ReportStatusRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService2 {

    @Autowired
    ReportRepository reportRepository;
    @Autowired
    ReportStatusRepository reportStatusRepository;
    @Autowired
    OperatorsRepository operatorsRepository;
    @Autowired
    ReportService3 reportService3;
    @Transactional
    public String closeReport(UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report with ID " + reportId + " not found"));

        report.setStatus("Closed");
        reportRepository.save(report);

        // 3. Create a new entry for the Status History
        ReportStatus history = new ReportStatus();
        history.setReports(report);
        history.setDate(LocalDate.now());
        history.setStatus("Closed");
        reportStatusRepository.save(history);

        // Create PDF LINK and return it
        return reportService3.getPDFReport(reportId);
    }
    public List<Report> getTasks(UUID workerId)
    {
        return reportRepository.findByWorkersId(workerId);
    }
    @Transactional
    public boolean updateStatus(Status dto) {
        Report report = reportRepository.findById(dto.getReportID())
                .orElseThrow(() -> new RuntimeException("Report with ID " + dto.getReportID() + " not found"));

        report.setStatus(dto.getNewStatus());
        reportRepository.save(report);

        ReportStatus history = new ReportStatus();
        history.setReports(report);
        history.setDate(dto.getCurrDate());
        history.setStatus(dto.getNewStatus());

        reportStatusRepository.save(history);
        return true ;
    }
    public String completeReportByWorker(CompletionDTO dto)
    {
        return null;
    }
}
