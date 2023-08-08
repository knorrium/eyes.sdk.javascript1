package com.applitools.eyes.images;

import com.applitools.eyes.EyesRunner;
import com.applitools.eyes.exceptions.StaleElementReferenceException;
import com.applitools.eyes.images.universal.mapper.ImageStaleElementReferenceException;
import com.applitools.eyes.universal.ManagerType;

public class ImageRunner extends EyesRunner {

    private static final ImagesRunnerSettings runnerSettings = new ImagesRunnerSettings();

    /**
     * used for instantiating Image Runner
     */
    public ImageRunner() {
        super(runnerSettings);
        managerRef = commandExecutor.coreMakeManager(ManagerType.CLASSIC.value, null);
    }

    /**
     * used for instantiating Image Runner
     */
    @Deprecated
    public ImageRunner(String baseAgentId, String version) {
        this();
    }

    @Override
    public StaleElementReferenceException getStaleElementException() {
        return new ImageStaleElementReferenceException();
    }

}
