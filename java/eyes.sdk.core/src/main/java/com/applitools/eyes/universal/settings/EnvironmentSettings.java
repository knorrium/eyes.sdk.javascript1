package com.applitools.eyes.universal.settings;

import com.applitools.utils.EnvironmentVersions;
import com.applitools.utils.GeneralUtils;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public abstract class EnvironmentSettings {
    private final String java = GeneralUtils.getPropertyString("java.version");

    public abstract EnvironmentVersions getVersions();

    public String getJava() {
        return java;
    }
}
