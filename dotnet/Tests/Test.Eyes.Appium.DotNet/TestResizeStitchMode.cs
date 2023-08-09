using System;
using NUnit.Framework;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Appium.Enums;

namespace Applitools.Appium.Tests
{
    public class TestStitchModes
    {
        [Test]
        public void TestResizeStitchMode()
        {
            var eyes = new Eyes();
            var caps = GetPixel3aXL_();
            Applitools.Appium.Eyes.SetMobileCapabilities(caps);
            AppiumDriver<AppiumWebElement> driver = new AndroidDriver<AppiumWebElement>
                (new Uri(TestDataProvider.SAUCE_SELENIUM_URL), caps, TimeSpan.FromMinutes(7));
            try
            {
                eyes.StitchMode = StitchModes.Resize;
                eyes.Open(driver, "Applitools Eyes SDK", "Test RESIZE StitchMode");
                eyes.Check(Target.Window());
                eyes.Close();
            }
            finally
            {
                eyes.Abort();
                driver.Quit();
            }

        }

        private static AppiumOptions GetPixel3aXL_()
        {
            AppiumOptions options = new AppiumOptions();
            options.AddAdditionalCapability(MobileCapabilityType.BrowserName, "");
            options.AddAdditionalCapability(MobileCapabilityType.PlatformName, "Android");
            options.AddAdditionalCapability(MobileCapabilityType.AppiumVersion, "1.20.2");
            options.AddAdditionalCapability(MobileCapabilityType.PlatformVersion, "10.0");
            options.AddAdditionalCapability(MobileCapabilityType.DeviceName, "Google Pixel 3a XL GoogleAPI Emulator");
            options.AddAdditionalCapability("username", TestDataProvider.SAUCE_USERNAME);
            options.AddAdditionalCapability("accesskey", TestDataProvider.SAUCE_ACCESS_KEY);
            options.AddAdditionalCapability("name", "Pixel 3a xl (c#)");
            options.AddAdditionalCapability(MobileCapabilityType.App, "storage:filename=simpleapp-appAndroidX-debug.apk");
            options.AddAdditionalCapability("appActivity", "JetpackComposeActivity");
            return options;
        }
    }
}