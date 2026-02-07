package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.Model.Department;
import com.shivsharan.HackFusion.Repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DepartmentService {
    @Autowired
    DepartmentRepository departmentRepository;

    public Department findByName(String name){
        return departmentRepository.findByName(name);
    }
}
