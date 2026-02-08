package com.shivsharan.HackFusion.Context;

/**
 * Stores current user info for the request
 * (Alternative to Spring Security's SecurityContextHolder)
 */
public class UserContext {

    private static final ThreadLocal<UserInfo> currentUser = new ThreadLocal<>();

    public static void setCurrentUser(UserInfo user) {
        currentUser.set(user);
    }

    public static UserInfo getCurrentUser() {
        return currentUser.get();
    }

    public static void clear() {
        currentUser.remove();
    }

    // Simple user info holder
    public static class UserInfo {
        private Long userId;
        private String username;
        private String userType; // CITIZEN, OFFICER, FIELD_STAFF

        public UserInfo(Long userId, String username, String userType) {
            this.userId = userId;
            this.username = username;
            this.userType = userType;
        }

        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public String getUserType() { return userType; }
    }
}