package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.Model.Operators;
import com.shivsharan.HackFusion.Repository.OperatorsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OperatorsService {

    @Autowired
    private OperatorsRepository operatorsRepository;

    public Operators findByUsername(String username){
        return operatorsRepository.findByUsername(username);
    }
}
