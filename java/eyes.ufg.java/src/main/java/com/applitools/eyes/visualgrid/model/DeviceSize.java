package com.applitools.eyes.visualgrid.model;

import com.applitools.eyes.RectangleSize;

public class DeviceSize {
    private RectangleSize portrait;
    private RectangleSize landscape;

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
}
