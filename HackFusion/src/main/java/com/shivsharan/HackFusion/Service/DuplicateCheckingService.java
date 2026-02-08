package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.Model.Report;
import com.shivsharan.HackFusion.Repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DuplicateCheckingService {
    @Autowired
    ReportRepository reportRepository;

    public Report findDuplicate(Report reportA){
        List<Report> reportList = reportRepository.findReportsWithinDistance(reportA.getLat(), reportA.getLon(), 0.5,
                reportA.getDepartment().getName());

        if(reportList.size() > 1){
            if(reportA == reportList.get(0)){
                return reportList.get(1);
            }
            return reportA;
        }
        return null;
    }

}
