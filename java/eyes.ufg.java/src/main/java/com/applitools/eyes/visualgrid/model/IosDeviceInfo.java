package com.applitools.eyes.visualgrid.model;

import com.applitools.eyes.RectangleSize;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

public class IosDeviceInfo implements IRenderingBrowserInfo {

    @JsonProperty("name")
    private final IosDeviceName deviceName;
    private final ScreenOrientation screenOrientation;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final IosVersion version;

    RectangleSize size = null;

    public IosDeviceInfo(IosDeviceName deviceName) {
        this(deviceName, ScreenOrientation.PORTRAIT);
    }

    public IosDeviceInfo(IosDeviceName deviceName, ScreenOrientation screenOrientation) {
        this(deviceName, screenOrientation, null);
    }

    public IosDeviceInfo(IosDeviceName deviceName, IosVersion version) {
        this(deviceName, ScreenOrientation.PORTRAIT, version);
    }

    public IosDeviceInfo(IosDeviceName deviceName, ScreenOrientation screenOrientation, IosVersion version) {
        this.deviceName = deviceName;
        this.screenOrientation = screenOrientation;
        this.version = version;
    }

    public String getDeviceName() {
        return deviceName.getName();
    }

    public ScreenOrientation getScreenOrientation() {
        return screenOrientation;
    }

    public IosVersion getVersion() {
        return version;
    }

    public RectangleSize getSize() {
        return size;
    }

    @Override
    public String toString() {
        return "IosDeviceInfo{" +
                "deviceName=" + deviceName +
                ", screenOrientation=" + screenOrientation +
                ", version=" + version +
                '}';
    }
}
