package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.DTO.DepartmentRankDTO;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.print.Doc;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService3 {
    @Autowired
    ReportRepository reportRepository;

    @Autowired
    DocumentService documentService;
    public void reOpen(UUID reportId){

    }

    public List<DepartmentRankDTO> getDepartmentsRankWise(){
        // I want you to return Department ID , department Name and metric
        // metric is Total reports of department , reports resolved of department and
        // not resolved and provide the avg resolution time
        return reportRepository.getDepartmentsRankWise() ;
    }

    public byte[] getPDFReport(UUID reportId){
        return documentService.generatePdfFromTemplate(reportId);
    }
    public Report getCompleteReport(UUID reportId){
        return reportRepository.findById(reportId).get();
    }
    public List<Report> getReportsOfUser(UUID userId)
    {
        return reportRepository.findBySenders_Id(userId);
    }
    public void getStats(){
        // weekly number of reports issued
        // number of the reports resolved
    }
}
