package com.shivsharan.HackFusion.Repository;

import com.shivsharan.HackFusion.Model.Operators;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OperatorsRepository extends JpaRepository<Operators, UUID>
{
    List<Operators> findByDepartment_Id(UUID departmentId);

}
