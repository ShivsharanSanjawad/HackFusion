package com.shivsharan.HackFusion.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class config {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")          // Apply to all endpoints in the app
                        .allowedOrigins("*")        // Allow all domains and ports
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow all HTTP methods
                        .allowedHeaders("*")        // Allow all headers
                        .exposedHeaders("Authorization"); // Optional: let frontend see auth headers
            }
        };
    }
}