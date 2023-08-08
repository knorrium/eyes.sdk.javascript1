package com.applitools.eyes.playwright;

import com.applitools.eyes.EyesRunner;
import com.applitools.eyes.exceptions.StaleElementReferenceException;
import com.applitools.eyes.playwright.universal.PlaywrightStaleElementReferenceException;
import com.applitools.eyes.playwright.universal.Refer;
import com.applitools.eyes.universal.ManagerType;

public class ClassicRunner extends EyesRunner {

    private static final PlaywrightRunnerSettings runnerSettings = new PlaywrightRunnerSettings();


    /**
     * used for instantiating Playwright Runner
     */
    public ClassicRunner() {
        super(runnerSettings);
        managerRef = commandExecutor.coreMakeManager(ManagerType.CLASSIC.value, null);
    }

    /**
     * used for instantiating Playwright Runner
     */
    @Deprecated
    public ClassicRunner(String baseAgentId, String version) {
        this();
    }

    @Override
    public StaleElementReferenceException getStaleElementException() {
        return new PlaywrightStaleElementReferenceException();
    }

    @Override
    protected Refer getRefer() {
        return runnerSettings.getListener().getRefer();
    }

}
