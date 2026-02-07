package com.shivsharan.HackFusion.Entity;

public enum IncidentType {
    POTHOLE("POTH", "Pothole"),
    WATER_LEAK("WATR", "Water Leak"),
    POWER_OUTAGE("POWR", "Power Outage"),
    STREET_LIGHT("LITE", "Street Light Issue"),
    DRAINAGE("DRGE", "Drainage Problem"),
    ROAD_DAMAGE("ROAD", "Road Damage"),
    GARBAGE("GARB", "Garbage Collection"),
    TREE_FALL("TREE", "Fallen Tree"),
    MANHOLE("MNHL", "Manhole Issue"),
    OTHER("OTHR", "Other");

    private final String code;
    private final String displayName;

    IncidentType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }
}