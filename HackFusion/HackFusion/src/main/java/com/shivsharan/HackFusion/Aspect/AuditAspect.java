package com.shivsharan.HackFusion.Aspect;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.UUID;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable)
            throws Throwable {

        // Get current user from context
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

        // ===== CAPTURE OLD STATE (BEFORE OPERATION) =====
        String oldState = null;
        if (auditable.logParameters() && joinPoint.getArgs().length > 0) {
            try {
                // Capture first argument as old state (typically the request body)
                oldState = convertToJson(joinPoint.getArgs()[0]);
                log.debug("Captured oldState from parameters: {}", oldState);
            } catch (Exception e) {
                log.debug("Could not capture oldState from parameters", e);
            }
        }

        // ===== ALSO LOG METHOD PARAMETERS IF ENABLED =====
        String parametersLog = null;
        if (auditable.logParameters()) {
            try {
                Object[] args = joinPoint.getArgs();
                if (args.length > 0) {
                    parametersLog = "Parameters: " + 
                        Arrays.toString(args).substring(0, Math.min(500, Arrays.toString(args).length()));
                }
            } catch (Exception e) {
                log.debug("Could not capture method parameters", e);
            }
        }

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
                .oldState(oldState)  // ✅ SET OLD STATE
                .description(auditable.description().isEmpty() ? parametersLog : auditable.description())
                .build();

        Object result = null;
        boolean success = false;

        try {
            // ===== EXECUTE THE ACTUAL METHOD =====
            result = joinPoint.proceed();
            success = true;

            // ===== CAPTURE NEW STATE (AFTER OPERATION) =====
            if (result != null && auditable.logResult()) {
                event.setEntityId(extractEntityId(result));
                event.setNewState(convertToJson(result));
                
                log.debug("Captured newState: Action={}, EntityType={}, EntityId={}", 
                    auditable.action(), auditable.entityType(), event.getEntityId());
            }

            return result;

        } catch (Exception e) {
            success = false;
            event.setDescription("ERROR: " + e.getMessage());
            log.error("Operation failed for action: {}", auditable.action(), e);
            throw e;

        } finally {
            event.setSuccess(success);
            
            // ===== LOG CHANGE DETECTION =====
            if (oldState != null && event.getNewState() != null) {
                log.info("CHANGE DETECTED - Action: {}, Entity: {}, ID: {} | Old → New State captured",
                    auditable.action(), auditable.entityType(), event.getEntityId());
            } else if (success && oldState == null && event.getNewState() != null) {
                log.info("CREATE OPERATION - Action: {}, Entity: {}, ID: {} | New state: {}",
                    auditable.action(), auditable.entityType(), event.getEntityId(), 
                    event.getNewState().substring(0, Math.min(100, event.getNewState().length())));
            } else if (!success) {
                log.warn("FAILED OPERATION - Action: {}, Entity: {} | Error: {}",
                    auditable.action(), auditable.entityType(), event.getDescription());
            }
            
            // Save to database
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