package com.applitools.eyes.selenium;

import com.applitools.eyes.universal.settings.EnvironmentSettings;
import com.applitools.eyes.universal.settings.RunnerSettings;
import com.applitools.utils.EnvironmentVersions;

public class SeleniumRunnerSettings extends RunnerSettings {

    private final static String baseAgentId = "eyes.selenium.java";

    @Override
    public String getBaseAgentId() {
        return baseAgentId;
    }

    @Override
    public EnvironmentSettings getEnvironment() {
        return new EnvironmentSettings() {
            @Override
            public EnvironmentVersions getVersions() {
                return new SeleniumEnvironmentVersions();
            }
        };
    }
}
