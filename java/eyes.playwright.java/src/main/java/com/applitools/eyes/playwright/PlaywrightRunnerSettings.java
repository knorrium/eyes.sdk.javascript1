package com.applitools.eyes.playwright;

import com.applitools.eyes.playwright.universal.PSDKListener;
import com.applitools.eyes.playwright.universal.driver.SpecDriverPlaywright;
import com.applitools.eyes.universal.settings.EnvironmentSettings;
import com.applitools.eyes.universal.settings.RunnerSettings;
import com.applitools.utils.EnvironmentVersions;

public class PlaywrightRunnerSettings extends RunnerSettings {

    private final static String baseAgentId = "eyes.playwright.java";

    private final static String protocol = "playwright";


    @Override
    public String getProtocol() {
        return protocol;
    }

    @Override
    public String getBaseAgentId() {
        return baseAgentId;
    }

    @Override
    public PSDKListener getListener() {
        return PSDKListener.getInstance();
    }

    public String[] getCommands() {
        return SpecDriverPlaywright.getMethodNames();
    }

    @Override
    public EnvironmentSettings getEnvironment() {
        return new EnvironmentSettings() {
            @Override
            public EnvironmentVersions getVersions() {
                return new PlaywrightEnvironmentVersions();
            }
        };
    }
}
