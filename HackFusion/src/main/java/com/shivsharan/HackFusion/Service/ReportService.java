package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.DTO.ReportRequest;
import com.shivsharan.HackFusion.DTO.assignDTO;
import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReportService {
    @Autowired
    ReportRepository reportRepository;
    public Report save(ReportRequest dto){
        return null ;
    }
    public List<Report> getReports(UUID departmentId)
    {
        return reportRepository.findByDepartmentId(departmentId);
    }
    public Report getReportStatus(UUID reportId)
    {
        return reportRepository.findByReportId(reportId);
    }
    public void getWorkers(UUID departmentId){

    }
    public void assignWorker(assignDTO dto){
    }
}
