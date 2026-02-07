package com.shivsharan.HackFusion.Model;

import jakarta.persistence.*;
import org.springframework.context.annotation.EnableMBeanExport;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
public class Report {
    @GeneratedValue(strategy = GenerationType.UUID)
    @Id
    UUID id ;

    @Column(nullable = false,unique = true)
    String username ;

    LocalDate date ;

    List<String> url ;

}
