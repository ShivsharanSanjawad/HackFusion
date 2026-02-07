package com.shivsharan.HackFusion.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
public class Citizen {

    @Id
            @GeneratedValue(strategy = GenerationType.UUID)
    UUID id ;

    String username ;

}
