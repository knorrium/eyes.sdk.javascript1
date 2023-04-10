package com.applitools.eyes.visualgrid.model;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonValue;

public enum IosVersion {

    LATEST("latest"),
    ONE_VERSION_BACK("latest-1");

    private final String version;

    IosVersion(String orientation) {
        this.version = orientation;
    }

    @JsonValue
    public String getVersion() {
        return version;
    }

    /**
     * @return the Enum representation for the given string.
     * @throws IllegalArgumentException if unknown string.
     */
    public static IosVersion fromVersion(String value) throws IllegalArgumentException {
        return Arrays.stream(IosVersion.values())
            .filter(v -> v.version.equalsIgnoreCase(value))
            .findFirst()
            .orElse(null);
    }

}
