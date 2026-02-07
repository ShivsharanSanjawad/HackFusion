package com.shivsharan.HackFusion.Entity;

public enum IncidentPriority {
    LOW("Low", "Can be addressed in routine maintenance", 7),
    MEDIUM("Medium", "Should be addressed soon", 3),
    HIGH("High", "Needs urgent attention", 1),
    CRITICAL("Critical", "Immediate safety hazard", 0);

    private final String displayName;
    private final String description;
    private final Integer expectedDays;

    IncidentPriority(String displayName, String description, Integer expectedDays) {
        this.displayName = displayName;
        this.description = description;
        this.expectedDays = expectedDays;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public Integer getExpectedDays() {
        return expectedDays;
    }
}