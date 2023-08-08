package com.applitools.eyes.appium;

import com.applitools.eyes.selenium.ClassicRunner;

public class AppiumRunner extends ClassicRunner {

    private static final AppiumRunnerSettings runnerSettings = new AppiumRunnerSettings();

    /**
     * used for instantiating Appium Runner
     */
    public AppiumRunner() {
        super(runnerSettings);
    }

}
