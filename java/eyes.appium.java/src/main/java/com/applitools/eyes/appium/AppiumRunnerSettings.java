package com.applitools.eyes.appium;

import com.applitools.eyes.universal.settings.EnvironmentSettings;
import com.applitools.eyes.universal.settings.RunnerSettings;
import com.applitools.utils.EnvironmentVersions;

public class AppiumRunnerSettings extends RunnerSettings {

    private static final String baseAgentId = "eyes.appium.java";

    @Override
    public String getBaseAgentId() {
        return baseAgentId;
    }

    @Override
    public EnvironmentSettings getEnvironment() {
        return new EnvironmentSettings() {
            @Override
            public EnvironmentVersions getVersions() {
                return new AppiumEnvironmentVersions();
            }
        };
    }
}
