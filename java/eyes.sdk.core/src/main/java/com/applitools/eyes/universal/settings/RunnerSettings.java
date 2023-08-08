package com.applitools.eyes.universal.settings;

import com.applitools.eyes.universal.AbstractSDKListener;
import com.applitools.eyes.universal.USDKListener;
import com.applitools.utils.ClassVersionGetter;
import com.applitools.utils.EnvironmentVersions;

public class RunnerSettings {

    private final static String baseAgentId = "eyes.sdk.java";
    private final static String protocol = "webdriver";
    private final static String cwd = System.getProperty("user.dir");

    public String getCwd() {
        return cwd;
    }

    public String getVersion() {
        return ClassVersionGetter.CURRENT_VERSION;
    }

    public String getProtocol() {
        return protocol;
    }

    public AbstractSDKListener getListener() {
        return USDKListener.getInstance();
    }

    public String getBaseAgentId() {
        return baseAgentId;
    }

    public String[] getCommands() {
        return null;
    }

    public EnvironmentSettings getEnvironment() {
        return new EnvironmentSettings() {
            @Override
            public EnvironmentVersions getVersions() {
                return null;
            }
        };
    }
}
