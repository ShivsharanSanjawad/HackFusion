package com.shivsharan.HackFusion.Entity;

public enum IncidentStatus {
    OPEN("Open", "Newly reported, awaiting review"),
    ACKNOWLEDGED("Acknowledged", "Department has seen the report"),
    ASSIGNED("Assigned", "Assigned to field staff"),
    IN_PROGRESS("In Progress", "Work has started"),
    ON_HOLD("On Hold", "Temporarily paused"),
    RESOLVED("Resolved", "Issue has been fixed"),
    VERIFIED("Verified", "Resolution verified by citizen"),
    CLOSED("Closed", "Case closed"),
    REJECTED("Rejected", "Not a valid incident"),
    DUPLICATE("Duplicate", "Duplicate of another report");

    private final String displayName;
    private final String description;

    IncidentStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}