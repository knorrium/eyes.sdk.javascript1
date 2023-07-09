using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading;
using Applitools.Metadata;
using Applitools.Selenium;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Appium.iOS;
using OpenQA.Selenium.Appium.Enums;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium;
using Applitools.Tests.Utils;
using Applitools.Utils;
using NUnit.Framework;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Safari;

namespace Applitools.Generated.Appium.Tests
{
	public abstract class TestSetupGeneratedAppium : FilteringTestSuite
	{
		protected enum browserType
		{
			Chrome,
			IE,
			Edge,
			Firefox,
			Safari11,
			Safari12
		}
		
		protected RemoteWebDriver driver;
		protected IWebDriver webDriver;
		protected EyesRunner runner;
		protected Applitools.Appium.Eyes eyes;
		protected string testedPageUrl = "https://applitools.github.io/demo/TestPages/FramesTestPage/";
		public static readonly BatchInfo BatchInfo = new BatchInfo("DotNet Generated Tests - Appium");
		public static readonly string DRIVER_PATH = Environment.GetEnvironmentVariable("DRIVER_PATH");
		public static readonly string SAUCE_USERNAME = Environment.GetEnvironmentVariable("SAUCE_USERNAME");
		public static readonly string SAUCE_ACCESS_KEY = Environment.GetEnvironmentVariable("SAUCE_ACCESS_KEY");
		public static readonly string SAUCE_SELENIUM_URL = "https://ondemand.us-west-1.saucelabs.com:443/wd/hub";
		public static readonly string EG_SELENIUM_URL = Environment.GetEnvironmentVariable("EXECUTION_GRID_URL");
		public static readonly string LOCAL_SELENIUM_URL = "http://localhost:4444/wd/hub";
		public static readonly string LOCAL_FIREFOX_SELENIUM_URL = "http://localhost:4445/wd/hub";

		protected void InitEyes(bool isVisualGrid, bool isCSSMode)
		{
			eyes = new Applitools.Appium.Eyes();
			eyes.MatchTimeout = TimeSpan.FromSeconds(10);
			eyes.Batch = BatchInfo;
			eyes.BranchName = "master";
			eyes.SaveNewTests = false;
            string testName = NUnit.Framework.TestContext.CurrentContext.Test.MethodName;
            ILogHandler logHandler = TestUtils.InitLogHandler(testName);
			//eyes.SetLogHandler(logHandler);
		}

		protected void InitDriver(string device, string app)
		{
			driver = MobileEmulation.InitDriver(device, app: app);
		}
		
		protected SessionResults GetTestInfo(TestResults results)
		{
			SessionResults sessionResults = null;
			try
			{
				sessionResults = TestUtils.GetSessionResults(eyes.ApiKey, results);
			}
			catch (Exception e)
			{
				CommonUtils.LogExceptionStackTrace(logger_, Stage.TestFramework, StageType.TestResults, e);
				Assert.Fail("Exception appeared while getting session results");
			}

			ArgumentGuard.NotNull(sessionResults, nameof(sessionResults));
			return sessionResults;
		}
		
		protected static ChromeDriver CreateChromeDriver(ChromeOptions options = null, bool headless = false)
		{
			ChromeDriver webDriver = RetryCreateWebDriver(() =>
			{
				options ??= new ChromeOptions();
				if (headless) options.AddArgument("--headless");

				ChromeDriver webDriverRet = DRIVER_PATH != null ? new ChromeDriver(DRIVER_PATH, options, TimeSpan.FromMinutes(4)) : new ChromeDriver(options);
				return webDriverRet;
			});
			return webDriver;
		}
		
		protected static FirefoxDriver CreateFirefoxDriver(bool headless = false)
		{
			FirefoxDriver webDriver = RetryCreateWebDriver(() =>
			{
				var options = new FirefoxOptions();
				if (headless) options.AddArgument("--headless");
				FirefoxDriver webDriverRet = DRIVER_PATH != null ?  new FirefoxDriver(DRIVER_PATH, options) : new FirefoxDriver(options);
				return webDriverRet;
			});
			return webDriver;
		}

		public static T RetryCreateWebDriver<T>(Func<T> func, int times = 3) where T : class, IWebDriver
		{
			int retriesLeft = times;
			int wait = 500;
			while (retriesLeft-- > 0)
			{
				try
				{
					T result = func.Invoke();
					if (result != null) return result;
				}
				catch (Exception)
				{
					if (retriesLeft == 0) throw;
				}
				Thread.Sleep(wait);
				wait *= 2;
				wait = Math.Min(10000, wait);
			}
			return null;
		}
	}
}
