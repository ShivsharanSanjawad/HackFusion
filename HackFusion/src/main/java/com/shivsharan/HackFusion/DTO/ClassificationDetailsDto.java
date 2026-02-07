package com.shivsharan.HackFusion.dto;

public class ClassificationDetailsDto {
    private String finalDepartment;
    private int finalPriority;
    private String finalDescription;
    private Float confidenceScore;

    public String getFinalDepartment() {
        return finalDepartment;
    }

    public void setFinalDepartment(String finalDepartment) {
        this.finalDepartment = finalDepartment;
    }

    public int getFinalPriority() {
        return finalPriority;
    }

    public void setFinalPriority(int finalPriority) {
        this.finalPriority = finalPriority;
    }

    public String getFinalDescription() {
        return finalDescription;
    }

    public void setFinalDescription(String finalDescription) {
        this.finalDescription = finalDescription;
    }

    public Float getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Float confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
}
