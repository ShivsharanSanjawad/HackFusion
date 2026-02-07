package com.shivsharan.HackFusion.Annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String action(); // e.g., "INCIDENT_CREATED", "STATUS_CHANGED"
    String entityType(); // e.g., "INCIDENT", "USER"
    boolean uploadToIpfs() default true; // Enable/disable IPFS
}