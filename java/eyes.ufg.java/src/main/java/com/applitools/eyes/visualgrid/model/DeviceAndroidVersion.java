package com.applitools.eyes.visualgrid.model;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonValue;

public enum DeviceAndroidVersion {
  LATEST("latest"),
  ONE_VERSION_BACK("latest-1");

  private final String version;

  DeviceAndroidVersion(String version) {
    this.version = version;
  }

  @JsonValue
  public String getVersion() {
    return version;
  }

  /**
   * @return the Enum representation for the given string.
   * @throws IllegalArgumentException if unknown string.
   */
  public static DeviceAndroidVersion fromVersion(String value) throws IllegalArgumentException {
    return Arrays.stream(DeviceAndroidVersion.values())
        .filter(v -> v.version.equalsIgnoreCase(value))
        .findFirst()
        .orElse(null);
  }

}
