package com.applitools.eyes.playwright.visualgrid;

import com.applitools.eyes.AbstractProxySettings;
import com.applitools.eyes.AutProxySettings;
import com.applitools.eyes.EyesRunner;
import com.applitools.eyes.Logger;
import com.applitools.eyes.playwright.PlaywrightRunnerSettings;
import com.applitools.eyes.playwright.universal.PlaywrightStaleElementReferenceException;
import com.applitools.eyes.playwright.universal.Refer;
import com.applitools.eyes.settings.EyesManagerSettings;
import com.applitools.eyes.universal.ManagerType;
import com.applitools.eyes.visualgrid.services.RunnerOptions;

/**
 * Used to manage multiple Eyes sessions when working with the Ultrafast Grid
 */
public class VisualGridRunner extends EyesRunner {

    private static final PlaywrightRunnerSettings runnerSettings = new PlaywrightRunnerSettings();

    static final int DEFAULT_CONCURRENCY = 5;
    private boolean isDisabled;
    private RunnerOptions runnerOptions;

    public VisualGridRunner() {
        this(new RunnerOptions().testConcurrency(DEFAULT_CONCURRENCY));
    }

    public VisualGridRunner(int testConcurrency) {
        super(runnerSettings);
        this.runnerOptions = new RunnerOptions().testConcurrency(testConcurrency);
        EyesManagerSettings managerSettings = new EyesManagerSettings(null, testConcurrency, null);
        managerRef = commandExecutor.coreMakeManager(ManagerType.VISUAL_GRID.value, managerSettings);
    }

    public VisualGridRunner(RunnerOptions runnerOptions) {
        super(runnerSettings, runnerOptions);
        this.runnerOptions = runnerOptions;
        int testConcurrency = runnerOptions.getTestConcurrency() == null ? DEFAULT_CONCURRENCY : runnerOptions.getTestConcurrency();
        EyesManagerSettings managerSettings = new EyesManagerSettings(testConcurrency, null, null);
        managerRef = commandExecutor.coreMakeManager(ManagerType.VISUAL_GRID.value, managerSettings);
    }

    @Override
    public com.applitools.eyes.exceptions.StaleElementReferenceException getStaleElementException() {
        return new PlaywrightStaleElementReferenceException();
    }

    @Override
    public AbstractProxySettings getProxy() { return this.runnerOptions.getProxy(); }

    public void setLogger(Logger logger) {
        this.logger = logger;
    }

    public void setProxy(AbstractProxySettings proxySettings) {
        if (proxySettings != null)
            this.runnerOptions = this.runnerOptions.proxy(proxySettings);
    }

    public void setAutProxy(AutProxySettings autProxy) {
        this.runnerOptions = this.runnerOptions.autProxy(autProxy);
    }

    public AutProxySettings getAutProxy() { return this.runnerOptions.getAutProxy(); }

    public void setIsDisabled(boolean isDisabled) {
        this.isDisabled = isDisabled;
    }

    public boolean getIsDisabled() {
        return this.isDisabled;
    }

    @Override
    protected Refer getRefer() {
        return runnerSettings.getListener().getRefer();
    }

}
