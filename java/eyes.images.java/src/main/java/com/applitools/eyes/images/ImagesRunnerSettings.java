package com.applitools.eyes.images;

import com.applitools.eyes.universal.settings.RunnerSettings;

public class ImagesRunnerSettings extends RunnerSettings {

    private static final String baseAgentId = "eyes.images.java";

    @Override
    public String getBaseAgentId() {
        return baseAgentId;
    }

}
