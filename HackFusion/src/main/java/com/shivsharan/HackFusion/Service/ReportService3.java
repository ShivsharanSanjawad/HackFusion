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
    public List<Report> getClump(double lat, double lon, double dist)
    {
        List<Report> reports = reportRepository.findReportsWithinDistance(lat, lon, dist);
        return reports;
    }

    public double getCivicScore(UUID userId) {
        // 1. Define your weights
        double w1 = 1.5; // Weight for total volume of participation
        double w2 = 5.0; // Weight for diversity of impact (unique categories)

        // 2. Fetch the components using a single optimized query
        // This returns an Object array: [Long totalReports, Long uniqueCategories]
        Object[] stats = reportRepository.findCivicMetricsByUserId(userId);

        if (stats == null || stats.length < 2) {
            return 0.0;
        }

        // JPA returns counts as Longs by default
        long Rv = (long) stats[0];
        long Ru = (long) stats[1];

        // 3. Calculate the weighted score
        double ret = (Rv * w1) + (Ru * w2);

        return ret;
    }
}
