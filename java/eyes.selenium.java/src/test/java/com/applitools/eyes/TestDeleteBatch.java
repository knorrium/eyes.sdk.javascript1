package com.applitools.eyes;

import com.applitools.eyes.config.Configuration;
import com.applitools.eyes.selenium.Eyes;
import com.applitools.eyes.selenium.fluent.Target;
import com.applitools.eyes.utils.ReportingTestSuite;
import com.applitools.eyes.utils.SeleniumUtils;
import com.applitools.eyes.visualgrid.BrowserType;
import com.applitools.eyes.visualgrid.services.RunnerOptions;
import com.applitools.eyes.visualgrid.services.VisualGridRunner;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

public class TestDeleteBatch extends ReportingTestSuite {

    @BeforeClass
    public void setup() {
        super.setGroupName("selenium");
    }

    private WebDriver driver;
    private Eyes eyes;
    private EyesRunner runner;
    private BatchInfo batch;
    private Configuration config;

    @BeforeTest(alwaysRun = true)
    public void before() {
        driver = SeleniumUtils.createChromeDriver(new ChromeOptions().setHeadless(true));

        batch = new BatchInfo("deleteTest");

        runner = new VisualGridRunner(new RunnerOptions().testConcurrency(5));

        config = new Configuration();
        config.setBatch(batch);
        config.setApiKey(System.getenv("APPLITOOLS_API_KEY_TEST_EYES"));
        config.setServerUrl("https://testeyes.applitools.com");
        config.addBrowser(800, 600, BrowserType.CHROME);
        config.addBrowser(700, 500, BrowserType.FIREFOX);
        config.addBrowser(1024, 768, BrowserType.EDGE_CHROMIUM);
        config.addBrowser(800, 600, BrowserType.SAFARI);
    }

    @AfterTest(alwaysRun = true)
    public void teardown() {
        if (driver != null) {
            driver.quit();
        }

        // find visual differences
        TestResultsSummary allTestResults = runner.getAllTestResults(false);
        System.out.println(allTestResults);
        TestResultContainer[] testResults = allTestResults.getAllResults();

        for (int i = 0; i < testResults.length; i++) {
            TestResults results = testResults[i].getTestResults();
            results.delete();
        }
    }

    @Test
    public void testDeleteTest() {
        eyes = new Eyes(runner);
        eyes.setConfiguration(config);

        eyes.open(driver, "Eyes Selenium SDK", "testDeleteTest");
        eyes.check(Target.window().fully(false));
        eyes.closeAsync();
    }
}