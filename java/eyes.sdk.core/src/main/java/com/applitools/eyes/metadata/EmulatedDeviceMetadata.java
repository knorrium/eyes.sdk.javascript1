package com.applitools.eyes.metadata;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmulatedDeviceMetadata {

    private Double pixelRatio;
    private Map<String, Object> capabilities;

    public Double getPixelRatio() {
        return pixelRatio;
    }

    public void setPixelRatio(Double pixelRatio) {
        this.pixelRatio = pixelRatio;
    }

    public Map<String, Object> getCapabilities() {
        return capabilities;
    }

    public void setCapabilities(Map<String, Object> capabilities) {
        this.capabilities = capabilities;
    }

    @Override
    public String toString() {
        return "EmulatedDeviceMetadata{" +
                "pixelRatio=" + pixelRatio +
                ", capabilities=" + capabilities +
                '}';
    }
}
