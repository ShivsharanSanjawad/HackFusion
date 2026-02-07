package com.shivsharan.HackFusion.Annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    
    // ===== REQUIRED FIELDS =====
    String action(); 
    // e.g., "INCIDENT_CREATED", "STATUS_CHANGED", "FILE_UPLOADED", "USER_DELETED"
    
    String entityType(); 
    // e.g., "INCIDENT", "USER", "DOCUMENT", "ASSIGNMENT", "REPORT"
    
    
    // ===== OPTIONAL FIELDS WITH DEFAULTS =====
    
    /**
     * Whether to upload audit log to IPFS (blockchain)
     * Default: true (all audits go to IPFS)
     **/
    boolean uploadToIpfs() default true;
    
    /**
     * Severity level of the action
     * Default: "INFO"
     * Options: "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"
     **/
    String severity() default "INFO";
    
    /**
     * Category/Module for organizing audits
     * Default: "GENERAL"
     * Examples: "INCIDENT_MANAGEMENT", "USER_MANAGEMENT", "DOCUMENT_MANAGEMENT"
     **/
    String category() default "GENERAL";
    
    /**
     * Custom description override
     * Default: empty (auto-generated from action)
     * Example: "Citizen reported water leakage at Main Street"
     **/
    String description() default "";
    
    /**
     * Whether to log method parameters/inputs
     * Default: false
     * Example: true = includes @RequestParam values in audit
     **/
    boolean logParameters() default false;
    
    /**
     * Whether to log return value/response
     * Default: true
     * Example: true = includes HTTP response/entity in audit
     **/
    boolean logResult() default true;
    
    /**
     * Skip audit if method throws exception
     * Default: false (audit even failed operations)
     * Example: true = don't audit rollback/failed transactions
     **/
    boolean skipOnException() default false;
    
    /**
     * Mark operation as requiring approval/review
     * Default: false
     * Example: true = for sensitive operations (delete, bulk update)
     **/
    boolean requiresApproval() default false;
    
    /**
     * Tags for filtering/searching audits
     * Default: empty
     * Example: {"citizen-report", "urgent", "mobile-app"}
     **/
    String[] tags() default {};
    
    /**
     * Correlation group to link related audits
     * Default: empty
     * Example: "INCIDENT_123_WORKFLOW" = links all audits for this incident
     **/
    String correlationGroup() default "";
    
    /**
     * Async timeout in milliseconds
     * Default: 30000 (30 seconds)
     * Example: 60000 = large file uploads
     **/
    long asyncTimeout() default 30000;
    
    /**
     * Custom metadata as key=value pairs
     * Default: empty
     * Example: {"source=mobile", "version=2.1", "region=north"}
     **/
    String[] metadata() default {};
}