package com.placement.system.dto;

public class ApplyDriveRequestDto {
    private String resumeUrl;
    private String resumeFileName;

    public ApplyDriveRequestDto() {}

    public ApplyDriveRequestDto(String resumeUrl, String resumeFileName) {
        this.resumeUrl = resumeUrl;
        this.resumeFileName = resumeFileName;
    }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
}
