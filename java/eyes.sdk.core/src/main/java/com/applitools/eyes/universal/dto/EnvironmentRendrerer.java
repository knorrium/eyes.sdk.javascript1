package com.applitools.eyes.universal.dto;

public class EnvironmentRendrerer {

    private RectangleSizeDto viewportSize;
    private String userAgent;

    public RectangleSizeDto getViewportSize() {
        return viewportSize;
    }

    public void setViewportSize(RectangleSizeDto viewportSize) {
        this.viewportSize = viewportSize;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
}
