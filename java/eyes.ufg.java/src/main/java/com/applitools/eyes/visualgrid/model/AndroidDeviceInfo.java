package com.applitools.eyes.visualgrid.model;

import com.applitools.eyes.RectangleSize;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AndroidDeviceInfo {
  @JsonProperty("name")
  private final AndroidDeviceName deviceName;
  private final ScreenOrientation screenOrientation;
  @JsonInclude(JsonInclude.Include.NON_NULL)
  private final DeviceAndroidVersion version;

  @JsonIgnore
  private String vhsType;

  RectangleSize size = null;

  public AndroidDeviceInfo(AndroidDeviceName deviceName) {
    this(deviceName, ScreenOrientation.PORTRAIT);
  }

  public AndroidDeviceInfo(AndroidDeviceName deviceName, ScreenOrientation screenOrientation) {
    this(deviceName, screenOrientation, null);
  }

  public AndroidDeviceInfo(AndroidDeviceName deviceName, DeviceAndroidVersion version) {
    this(deviceName, ScreenOrientation.PORTRAIT, version);
  }

  public AndroidDeviceInfo(AndroidDeviceName deviceName, ScreenOrientation screenOrientation, DeviceAndroidVersion version) {
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

  public DeviceAndroidVersion getVersion() {
    return version;
  }

  public String getVhsType() {
    return vhsType;
  }

  public void setVhsType(String vhsType) {
    this.vhsType = vhsType;
  }

  @Override
  public String toString() {
    return "AndroidDecideInfo{" +
        "deviceName=" + deviceName +
        ", screenOrientation=" + screenOrientation +
        ", version=" + version +
        '}';
  }
}
