package com.applitools.eyes.visualgrid.services;

import com.applitools.eyes.AbstractProxySettings;
import com.applitools.eyes.AutProxySettings;
import com.applitools.eyes.EyesRunner;
import com.applitools.eyes.Logger;
import com.applitools.eyes.selenium.SeleniumRunnerSettings;
import com.applitools.eyes.selenium.exceptions.StaleElementReferenceException;
import com.applitools.eyes.settings.EyesManagerSettings;
import com.applitools.eyes.universal.ManagerType;
import com.applitools.eyes.universal.settings.RunnerSettings;
import com.applitools.utils.ArgumentGuard;

/**
 * Used to manage multiple Eyes sessions when working with the Ultrafast Grid
 */
public class VisualGridRunner extends EyesRunner {

    static final int DEFAULT_CONCURRENCY = 5;
    private boolean isDisabled;
    private RunnerOptions runnerOptions;
    private static final SeleniumRunnerSettings runnerSettings = new SeleniumRunnerSettings();

    public VisualGridRunner() {
        this(Thread.currentThread().getStackTrace()[2].getClassName());
    }

    public VisualGridRunner(String suiteName) {
        this(new RunnerOptions().testConcurrency(DEFAULT_CONCURRENCY));
    }

    public VisualGridRunner(int testConcurrency) {
        this(testConcurrency, Thread.currentThread().getStackTrace()[2].getClassName());
    }

    public VisualGridRunner(int testConcurrency, String suiteName) {
        super(runnerSettings);
        this.runnerOptions = new RunnerOptions().testConcurrency(testConcurrency);
        EyesManagerSettings managerSettings = new EyesManagerSettings(null, testConcurrency, null);
        managerRef = commandExecutor.coreMakeManager(ManagerType.VISUAL_GRID.value, managerSettings);
    }

    public VisualGridRunner(RunnerOptions runnerOptions) {
        this(runnerOptions, Thread.currentThread().getStackTrace()[2].getClassName());
    }

    public VisualGridRunner(RunnerOptions runnerOptions, String suiteName) {
        super(runnerSettings, runnerOptions);
        this.runnerOptions = runnerOptions;
        int testConcurrency = runnerOptions.getTestConcurrency() == null ? DEFAULT_CONCURRENCY : runnerOptions.getTestConcurrency();
        EyesManagerSettings managerSettings = new EyesManagerSettings(testConcurrency, null, null);
        managerRef = commandExecutor.coreMakeManager(ManagerType.VISUAL_GRID.value, managerSettings);
    }

    protected VisualGridRunner(RunnerSettings runnerSettings) {
        super(runnerSettings);
        this.runnerOptions = new RunnerOptions().testConcurrency(DEFAULT_CONCURRENCY);
        EyesManagerSettings managerSettings = new EyesManagerSettings(DEFAULT_CONCURRENCY, null, null);
        managerRef = commandExecutor.coreMakeManager(ManagerType.VISUAL_GRID.value, managerSettings);
    }

    protected VisualGridRunner(int testConcurrency, RunnerSettings runnerSettings) {
        super(runnerSettings);
        this.runnerOptions = new RunnerOptions().testConcurrency(testConcurrency);
        EyesManagerSettings managerSettings = new EyesManagerSettings(null, testConcurrency, null);
        managerRef = commandExecutor.coreMakeManager(ManagerType.VISUAL_GRID.value, managerSettings);
    }

    protected VisualGridRunner(RunnerSettings runnerSettings, RunnerOptions runnerOptions) {
        super(runnerSettings);
        ArgumentGuard.notNull(runnerOptions, "runnerOptions");
        this.runnerOptions = runnerOptions;
        int testConcurrency = runnerOptions.getTestConcurrency() == null ? DEFAULT_CONCURRENCY : runnerOptions.getTestConcurrency();
        EyesManagerSettings managerSettings = new EyesManagerSettings(testConcurrency, null, null);
        managerRef = commandExecutor.coreMakeManager(ManagerType.VISUAL_GRID.value, managerSettings);
    }

    @Override
    public com.applitools.eyes.exceptions.StaleElementReferenceException getStaleElementException() {
        return new StaleElementReferenceException();
    }

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

    @Override
    public AbstractProxySettings getProxy() { return this.runnerOptions.getProxy(); }

    public void setIsDisabled(boolean isDisabled) {
        this.isDisabled = isDisabled;
    }

    public boolean getIsDisabled() {
        return this.isDisabled;
    }
}
