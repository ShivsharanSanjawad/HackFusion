package com.shivsharan.HackFusion.Repository;

import com.shivsharan.HackFusion.Model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Department findByName(String name);
}