package com.shivsharan.HackFusion.Service;

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

    public void getDepartmentsRankWise(){
        // I want you to return Department ID , department Name and metric
        // metric is Total reports of department , reports resolved of department and
        // not resolved and provide the avg resolution time
    }

    public byte[] getPDFReport(UUID reportId){
        return documentService.generatePdfFromTemplate(reportId);
    }
    public void getCompleteReport(UUID reportId){
        // I want you to return entire Report Object
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
