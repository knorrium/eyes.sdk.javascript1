package com.applitools.eyes;

import com.applitools.eyes.exceptions.DiffsFoundException;
import com.applitools.eyes.exceptions.NewTestException;
import com.applitools.eyes.exceptions.StaleElementReferenceException;
import com.applitools.eyes.exceptions.TestFailedException;
import com.applitools.eyes.logging.Stage;
import com.applitools.eyes.logging.Type;
import com.applitools.eyes.settings.GetResultsSettings;
import com.applitools.eyes.universal.CommandExecutor;
import com.applitools.eyes.universal.Refer;
import com.applitools.eyes.universal.Reference;
import com.applitools.eyes.universal.dto.TestResultsSummaryDto;
import com.applitools.eyes.universal.mapper.TestResultsSummaryMapper;
import com.applitools.eyes.universal.server.UniversalSdkNativeLoader;
import com.applitools.eyes.universal.settings.RunnerSettings;
import com.applitools.eyes.visualgrid.services.RunnerOptions;
import com.applitools.utils.ArgumentGuard;
import org.apache.commons.lang3.tuple.Pair;

public abstract class EyesRunner implements AutoCloseable {

  /**
   * command executor
   */
  protected CommandExecutor commandExecutor;

  /**
   * this reference has to be used in order to perform manager related actions (EyesManager.openEyes, EyesManager.closeAllEyes)
   */
  protected Reference managerRef;
  protected Logger logger = new Logger();
  private Boolean dontCloseBatches;
  private Boolean removeDuplicateTests;
  private static final RunnerSettings runnerSettings = new RunnerSettings();

  /**
   * used for instantiating Classic Runner
   */
  public EyesRunner() {
    setLogHandler(new NullLogHandler());
    runServer(runnerSettings);
  }

  /**
   * used for instantiating Classic Runner
   */
  @Deprecated
  public EyesRunner(String baseAgentId, String version) {
    setLogHandler(new NullLogHandler());
    runServer(runnerSettings);
  }

  public EyesRunner(RunnerSettings runnerSettings) {
    setLogHandler(new NullLogHandler());
    runServer(runnerSettings);
  }

  public EyesRunner(RunnerSettings runnerSettings, RunnerOptions runnerOptions) {
    ArgumentGuard.notNull(runnerOptions, "runnerOptions");
    setLogHandler(runnerOptions.getLogHandler());
    runServer(runnerSettings);
  }

  protected void runServer(RunnerSettings runnerSettings) {
    UniversalSdkNativeLoader.setLogger(getLogger());
    UniversalSdkNativeLoader.start();

    commandExecutor = CommandExecutor.getInstance(runnerSettings, getStaleElementException());
  }

  public TestResultsSummary getAllTestResults(boolean shouldThrowException) {
    GetResultsSettings settings = new GetResultsSettings(shouldThrowException, removeDuplicateTests);
    TestResultsSummaryDto dto = commandExecutor.getResults(managerRef, settings);
    return TestResultsSummaryMapper.fromDto(dto, shouldThrowException);
  }

  public void setLogHandler(LogHandler logHandler) {
    logger.setLogHandler(logHandler);
    if (!logHandler.isOpen()) {
      logHandler.open();
    }
  }

  public void logSessionResultsAndThrowException(boolean throwEx, TestResults results) {
    if (results == null) {
      return;
    }
    TestResultsStatus status = results.getStatus();
    String sessionResultsUrl = results.getUrl();
    String scenarioIdOrName = results.getName();
    String appIdOrName = results.getAppName();
    if (status == null) {
      throw new EyesException("Status is null in the test results");
    }

    logger.log(results.getId(), Stage.CLOSE, Type.TEST_RESULTS, Pair.of("status", status), Pair.of("url", sessionResultsUrl));
    switch (status) {
      case Failed:
        if (throwEx) {
          throw new TestFailedException(results, scenarioIdOrName, appIdOrName);
        }
        break;
      case Passed:
        break;
      case NotOpened:
        if (throwEx) {
          throw new EyesException("Called close before calling open");
        }
        break;
      case Unresolved:
        if (results.isNew()) {
          if (throwEx) {
            throw new NewTestException(results, scenarioIdOrName, appIdOrName);
          }
        } else {
          if (throwEx) {
            throw new DiffsFoundException(results, scenarioIdOrName, appIdOrName);
          }
        }
        break;
    }
  }

  protected StaleElementReferenceException getStaleElementException() {
    return new StaleElementReferenceException() {
      @Override
      public void throwException(String message) {
        throw new RuntimeException(message);
      }
    };
  }

  public TestResultsSummary getAllTestResults() {
    return getAllTestResults(true);
  }

  public void setDontCloseBatches(boolean dontCloseBatches) {
    this.dontCloseBatches = dontCloseBatches;
  }

  public Boolean isDontCloseBatches() {
    return dontCloseBatches;
  }

  public void setRemoveDuplicateTests(Boolean removeDuplicateTests) {
    this.removeDuplicateTests = removeDuplicateTests;
  }

  public Boolean getRemoveDuplicateTests() {
    return removeDuplicateTests;
  }

  public Logger getLogger() {
    return this.logger;
  }

  public void setProxy(AbstractProxySettings proxySettings) {
  }

  public AbstractProxySettings getProxy() {
    return null;
  }

  public String getAgentId() {
    return runnerSettings.getBaseAgentId();
  }

  /**
   * manager reference
   */
  public Reference getManagerRef() {
    return managerRef;
  }

  /**
   * @param  managerRef The manager reference
   */
  public void setManagerRef(Reference managerRef) {
    this.managerRef = managerRef;
  }

  /**
   * command executor
   */
  public CommandExecutor getCommandExecutor() {
    return commandExecutor;
  }

  /**
   * @param  commandExecutor The command executor
   */
  public void setCommandExecutor(CommandExecutor commandExecutor) {
    this.commandExecutor = commandExecutor;
  }


  protected Refer getRefer() {
    return runnerSettings.getListener().getRefer();
  }

  @Override
  public void close() {
    commandExecutor.close();
  }
}
