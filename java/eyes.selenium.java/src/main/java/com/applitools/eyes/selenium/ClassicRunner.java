package com.applitools.eyes.selenium;

import com.applitools.eyes.EyesRunner;
import com.applitools.eyes.exceptions.StaleElementReferenceException;
import com.applitools.eyes.universal.ManagerType;
import com.applitools.eyes.universal.settings.RunnerSettings;


/**
 * used to manage multiple Eyes sessions when working without the Ultrafast Grid.
 */
public class ClassicRunner extends EyesRunner {

  private static final SeleniumRunnerSettings runnerSettings = new SeleniumRunnerSettings();

  public ClassicRunner() {
    super(runnerSettings);
    managerRef = commandExecutor.coreMakeManager(ManagerType.CLASSIC.value, null);
  }

  protected ClassicRunner(RunnerSettings runnerSettings) {
    super(runnerSettings);
    managerRef = commandExecutor.coreMakeManager(ManagerType.CLASSIC.value, null);
  }

  @Deprecated
  protected ClassicRunner(String baseAgentId, String version) {
    this();
  }

  @Override
  public StaleElementReferenceException getStaleElementException() {
    return new com.applitools.eyes.selenium.exceptions.StaleElementReferenceException();
  }
}
