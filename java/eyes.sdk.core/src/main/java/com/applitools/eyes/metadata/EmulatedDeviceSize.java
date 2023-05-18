package com.applitools.eyes.metadata;

import com.applitools.eyes.RectangleSize;

public class EmulatedDeviceSize {

    private RectangleSize portrait;
    private RectangleSize landscape;
    private EmulatedDeviceMetadata metadata;

    public RectangleSize getPortrait() {
        return portrait;
    }

    public void setPortrait(RectangleSize portrait) {
        this.portrait = portrait;
    }

    public RectangleSize getLandscape() {
        return landscape;
    }

    public void setLandscape(RectangleSize landscape) {
        this.landscape = landscape;
    }

    public EmulatedDeviceMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(EmulatedDeviceMetadata metadata) {
        this.metadata = metadata;
    }

    @Override
    public String toString() {
        return "EmulatedDeviceSize{" +
                "portrait=" + portrait +
                ", landscape=" + landscape +
                ", metadata=" + metadata +
                '}';
    }
}
