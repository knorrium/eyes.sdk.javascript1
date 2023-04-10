package com.applitools.eyes.visualgrid.model;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonValue;

public enum  AndroidDeviceName {
  Sony_Xperia_10_II("Sony Xperia 10 II"),
  Pixel_3_XL("Pixel 3 XL"),
  Pixel_4("Pixel 4"),
  Pixel_4_XL("Pixel 4 XL"),
  Galaxy_Note_9("Galaxy Note 9"),
  Galaxy_S9("Galaxy S9"),
  Galaxy_S9_Plus("Galaxy S9 Plus"),
  Galaxy_S10("Galaxy S10"),
  Galaxy_S10_Plus("Galaxy S10 Plus"),
  Galaxy_Note_10("Galaxy Note 10"),
  Galaxy_Note_10_Plus("Galaxy Note 10 Plus"),
  Galaxy_S20("Galaxy S20"),
  Galaxy_S20_PLUS("Galaxy S20 Plus"),
  Galaxy_S21("Galaxy S21"),
  Galaxy_S21_PLUS("Galaxy S21 Plus"),
  Galaxy_S21_ULTRA("Galaxy S21 Ultra"),
  Xiaomi_Redmi_Note_11_Pro("Xiaomi Redmi Note 11 Pro"),
  Xiaomi_Redmi_Note_11("Xiaomi Redmi Note 11"),
  Pixel_6("Pixel 6"),
  Pixel_5("Pixel 5"),
  Galaxy_S22("Galaxy S22"),
  Galaxy_S22_Plus("Galaxy S22 Plus"),
  Galaxy_Tab_S8("Galaxy S22"),
  Galaxy_Tab_S7("Galaxy Tab S7");

  private final String name;

  AndroidDeviceName(String name) {
    this.name = name;
  }

  @JsonValue
  public String getName() {
    return name;
  }

  /**
   * @return the Enum representation for the given string.
   * @throws IllegalArgumentException if unknown string.
   */
  public static AndroidDeviceName fromName(String value) throws IllegalArgumentException {
    return Arrays.stream(AndroidDeviceName.values())
        .filter(v -> v.name.equalsIgnoreCase(value))
        .findFirst()
        .orElse(null);
  }

  @Override
  public String toString() {
    return "AndroidDeviceName{" +
        "name='" + name + '\'' +
        '}';
  }
}
