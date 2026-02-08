package com.shivsharan.HackFusion.HackServer;

import de.codecentric.boot.admin.server.config.EnableAdminServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@EnableAdminServer
@SpringBootApplication
public class HackServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(HackServerApplication.class, args);
	}

}
