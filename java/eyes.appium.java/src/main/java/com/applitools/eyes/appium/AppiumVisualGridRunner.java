package com.applitools.eyes.appium;

import com.applitools.eyes.visualgrid.services.RunnerOptions;
import com.applitools.eyes.visualgrid.services.VisualGridRunner;
import com.applitools.utils.ClassVersionGetter;

public class AppiumVisualGridRunner extends VisualGridRunner {

  private static final AppiumRunnerSettings runnerSettings = new AppiumRunnerSettings();

  public AppiumVisualGridRunner() {
    super(runnerSettings);
  }

  public AppiumVisualGridRunner(String suiteName) {
    super(runnerSettings);
  }

  public AppiumVisualGridRunner(int testConcurrency) {
    this(testConcurrency, Thread.currentThread().getStackTrace()[2].getClassName());
  }

  public AppiumVisualGridRunner(int testConcurrency0, String suiteName) {
    super(testConcurrency0, runnerSettings);
  }

  public AppiumVisualGridRunner(RunnerOptions runnerOptions) {
    this(runnerOptions, Thread.currentThread().getStackTrace()[2].getClassName());
  }

  public AppiumVisualGridRunner(RunnerOptions runnerOptions, String suiteName) {
    super(runnerSettings, runnerOptions);
  }

}
