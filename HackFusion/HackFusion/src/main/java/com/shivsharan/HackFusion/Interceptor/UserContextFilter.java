package com.shivsharan.HackFusion.Interceptor;

import com.shivsharan.HackFusion.Context.UserContext;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Extract user info from request and set in context
 */
@Component
public class UserContextFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        try {
            // Extract user info from request headers/session
            // (Adjust based on your authentication mechanism)

            Long userId = extractUserId(httpRequest);
            String username = extractUsername(httpRequest);
            String userType = extractUserType(httpRequest);

            if (userId != null) {
                UserContext.setCurrentUser(
                        new UserContext.UserInfo(userId, username, userType)
                );
            }

            chain.doFilter(request, response);

        } finally {
            // Always clear after request
            UserContext.clear();
        }
    }

    private Long extractUserId(HttpServletRequest request) {
        // Option 1: From header
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader != null) {
            return Long.parseLong(userIdHeader);
        }

        // Option 2: From session
        Object userId = request.getSession().getAttribute("userId");
        if (userId != null) {
            return (Long) userId;
        }

        // Option 3: From JWT token (if you're using JWT)
        // String token = request.getHeader("Authorization");
        // return extractUserIdFromJwt(token);

        return null;
    }

    private String extractUsername(HttpServletRequest request) {
        String username = request.getHeader("X-Username");
        if (username != null) return username;

        Object sessionUsername = request.getSession().getAttribute("username");
        if (sessionUsername != null) return (String) sessionUsername;

        return "anonymous";
    }

    private String extractUserType(HttpServletRequest request) {
        String type = request.getHeader("X-User-Type");
        if (type != null) return type;

        Object sessionType = request.getSession().getAttribute("userType");
        if (sessionType != null) return (String) sessionType;

        return "UNKNOWN";
    }
}