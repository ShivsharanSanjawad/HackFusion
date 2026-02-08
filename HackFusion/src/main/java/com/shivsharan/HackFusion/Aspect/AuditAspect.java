package com.shivsharan.HackFusion.Aspect;

import java.time.LocalDateTime;
import java.util.UUID;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.shivsharan.HackFusion.Annotation.Auditable;
import com.shivsharan.HackFusion.Context.UserContext;
import com.shivsharan.HackFusion.DTO.AuditEvent;
import com.shivsharan.HackFusion.Service.AuditService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditService auditService;

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable)
            throws Throwable {

        // Get current user from context (instead of Spring Security)
        UserContext.UserInfo currentUser = UserContext.getCurrentUser();

        Long actorId = null;
        String actorUsername = "anonymous";
        String actorType = "UNKNOWN";

        if (currentUser != null) {
            actorId = currentUser.getUserId();
            actorUsername = currentUser.getUsername();
            actorType = currentUser.getUserType();
        }

        // Get HTTP request info
        HttpServletRequest request = getCurrentRequest();
        String ipAddress = (request != null) ? request.getRemoteAddr() : "unknown";

        // Create audit event
        AuditEvent event = AuditEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .timestamp(LocalDateTime.now())
                .actorId(actorId)
                .actorUsername(actorUsername)
                .actorType(actorType)
                .entityType(auditable.entityType())
                .action(auditable.action())
                .ipAddress(ipAddress)
                .uploadToIpfs(auditable.uploadToIpfs())
                .build();

        Object result = null;
        boolean success = false;

        try {
            // Execute the actual method
            result = joinPoint.proceed();
            success = true;

            // Extract entity ID from result
            if (result != null) {
                event.setEntityId(extractEntityId(result));
                event.setNewState(convertToJson(result));
            }

            return result;

        } catch (Exception e) {
            event.setDescription("Error: " + e.getMessage());
            throw e;

        } finally {
            event.setSuccess(success);
            auditService.logEvent(event);
        }
    }

    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return (attributes != null) ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Long extractEntityId(Object result) {
        if (result == null) {
            return null;
        }

        try {
            // Try to get getId() method
            var method = result.getClass().getMethod("getId");
            Object id = method.invoke(result);
            
            if (id instanceof Long) {
                return (Long) id;
            } else if (id instanceof Integer) {
                return ((Integer) id).longValue();
            }
            return null;
            
        } catch (NoSuchMethodException e) {
            // Method doesn't have getId() - not an entity, that's okay
            log.debug("Result type {} does not have getId() method - may not be an entity", 
                    result.getClass().getSimpleName());
            return null;
        } catch (Exception e) {
            log.debug("Could not extract entity ID from result", e);
            return null;
        }
    }

    private String convertToJson(Object obj) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }
}