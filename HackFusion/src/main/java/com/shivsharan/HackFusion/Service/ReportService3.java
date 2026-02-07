package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.DTO.DepartmentRankDTO;
import com.shivsharan.HackFusion.DTO.OverallStatsDTO;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.print.Doc;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService3 {
    @Autowired
    ReportRepository reportRepository;

    @Autowired
    DocumentService documentService;
    public void reOpen(UUID reportId)
    {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("Report not found with id: " + reportId));

        report.setStatus("OPEN");

        reportRepository.save(report);
    }

    public List<DepartmentRankDTO> getDepartmentsRankWise(){
        // I want you to return Department ID , department Name and metric
        // metric is Total reports of department , reports resolved of department and
        // not resolved and provide the avg resolution time
        return reportRepository.getDepartmentsRankWise() ;
    }

    public String getPDFReport(UUID reportId){
        return documentService.generatePdfFromTemplate(reportId);
    }

    public Report getCompleteReport(UUID reportId){
        return reportRepository.findById(reportId).get();
    }

    public List<Report> getReportsOfUser(UUID userId)
    {
        return reportRepository.findBySenders_Id(userId);
    }
    public OverallStatsDTO getStats(){
        // weekly number of reports issued
        // number of the reports resolved
        LocalDate weekStart = LocalDate.now().minusWeeks(1);
        return reportRepository.getOverallStats(weekStart);
    }
}
