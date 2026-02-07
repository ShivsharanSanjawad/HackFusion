package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.Model.Department;
import com.shivsharan.HackFusion.Model.Report;
import org.springframework.stereotype.Service;

@Service
public class MLpipeline {

    public void update(Report r){
        Department department = r.getDepartment();
        if(department == null){
            setDepartMent();
        }

    }
}
