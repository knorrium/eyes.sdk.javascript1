using System;
using System.Collections.Generic;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Appium.Enums;
using OpenQA.Selenium.Appium.iOS;
using OpenQA.Selenium.Remote;

namespace Applitools.Tests.Utils
{
    public static class MobileEmulation
    {
        public static readonly Dictionary<string, Dictionary<string, object>> Devices =
            new()
            {
                {
                    "Android Emulator", new Dictionary<string, object>
                    {
                        { "deviceName", "Android Emulator" },
                        { "platformName", "Android" },
                        { "platformVersion", "6.0" },
                        { "deviceOrientation", "landscape" },
                        { "clearSystemFiles", true },
                        { "noReset", true },
                        { "url", SauceServerUrl },
                        { "sauce", true },
                        { "name", "Android Demo" }
                    }
                },
                {
                    "Samsung Galaxy S8", new Dictionary<string, object>
                    {
                        { "browserName", "" },
                        { "deviceName", "Samsung Galaxy S8 FHD GoogleAPI Emulator" },
                        { "platformName", "Android" },
                        { "platformVersion", "8.1" },
                        { "username", Environment.GetEnvironmentVariable("SAUCE_USERNAME") },
                        { "access_key", Environment.GetEnvironmentVariable("SAUCE_ACCESS_KEY") },
                        { "url", SauceServerUrl },
                        { "sauce", true },
                        { "name", "Android Demo" }
                    }
                },
                {
                    "iPhone XS", new Dictionary<string, object>
                    {
                        { "browserName", "" },
                        { "deviceName", "iPhone XS Simulator" },
                        { "platformName", "iOS" },
                        { "platformVersion", "13.2" },
                        { "username", Environment.GetEnvironmentVariable("SAUCE_USERNAME") },
                        { "access_key", Environment.GetEnvironmentVariable("SAUCE_ACCESS_KEY") },
                        { "url", SauceServerUrl },
                        { "sauce", true },
                        { "name", "iOS Native Demo" }
                    }
                },
                {
                    "Pixel 3 XL", new Dictionary<string, object>
                    {
                        { "browserName", "" },
                        { "deviceName", "Google Pixel 3 XL GoogleAPI Emulator" },
                        { "platformName", "Android" },
                        { "platformVersion", "11" },
                        { "automationName", "UiAutomator2" },
                        { "username", Environment.GetEnvironmentVariable("SAUCE_USERNAME") },
                        { "access_key", Environment.GetEnvironmentVariable("SAUCE_ACCESS_KEY") },
                        { "url", SauceServerUrl },
                        { "sauce", true },
                        { "name", "Android Native Demo" }
                    }
                },
                {
                    "Pixel 3a XL", new Dictionary<string, object>
                    {
                        { "deviceName", "Google Pixel 3a XL GoogleAPI Emulator" },
                        { "platformName", "Android" },
                        { "platformVersion", "11" },
                        { "automationName", "UiAutomator2" },
                        { "username", Environment.GetEnvironmentVariable("SAUCE_USERNAME") },
                        { "access_key", Environment.GetEnvironmentVariable("SAUCE_ACCESS_KEY") },
                        { "url", SauceServerUrl },
                        { "sauce", true },
                        { "name", "Android Native Demo" }
                    }
                },
                {
                    "iPhone 12", new Dictionary<string, object>
                    {
                        { "deviceName", "iPhone 12 Simulator" },
                        { "platformName", "iOS" },
                        { "platformVersion", "15" },
                        // ReSharper disable once StringLiteralTypo
                        { "automationName", "XCUITest" },
                        { "username", Environment.GetEnvironmentVariable("SAUCE_USERNAME") },
                        { "access_key", Environment.GetEnvironmentVariable("SAUCE_ACCESS_KEY") },
                        { "url", SauceServerUrl },
                        { "sauce", true },
                        { "name", "iOS Native Demo" }
                    }
                },
            };

        public const string SauceServerUrl = "https://ondemand.saucelabs.com:443/wd/hub";

        public static readonly Dictionary<string, Dictionary<string, string>> Credentials =
            new()
            {
                {
                    "sauce", new Dictionary<string, string>
                    {
                        { "username", Environment.GetEnvironmentVariable("SAUCE_USERNAME") },
                        { "access_key", Environment.GetEnvironmentVariable("SAUCE_ACCESS_KEY") }
                    }
                }
            };

        public static RemoteWebDriver InitDriver(string device, string app = null, string browser = null)
        {
            AppiumOptions options = new AppiumOptions();
            //options.AddAdditionalCapability(MobileCapabilityType.AppiumVersion, "1.17.1");
            options.AddAdditionalCapability(MobileCapabilityType.PlatformName,
                Devices[device]["platformName"]);
            options.AddAdditionalCapability(MobileCapabilityType.PlatformVersion,
                Devices[device]["platformVersion"]);
            options.AddAdditionalCapability(MobileCapabilityType.DeviceName,
                Devices[device]["deviceName"]);
            if (Devices[device].ContainsKey("deviceOrientation"))
                options.AddAdditionalCapability("deviceOrientation",
                    Devices[device]["deviceOrientation"]);
            else options.AddAdditionalCapability("deviceOrientation", "portrait");

            if (browser != null)
            {
                options.AddAdditionalCapability("browserName", browser);
            }
            else if (app != null)
            {
                options.AddAdditionalCapability(MobileCapabilityType.App, app);
            }

            options.AddAdditionalCapability("phoneOnly", false);
            options.AddAdditionalCapability("tabletOnly", false);
            options.AddAdditionalCapability("privateDevicesOnly", false);


            string url = null;
            if (Devices[device].ContainsKey("sauce"))
            {
                options.AddAdditionalCapability("username", Credentials["sauce"]["username"]);
                options.AddAdditionalCapability("accesskey", Credentials["sauce"]["access_key"]);
                url = SauceServerUrl;
            }

            string platformName = (string)Devices[device]["platformName"];
            options.AddAdditionalCapability("name", $"{platformName} Demo");

            options.AddAdditionalCapability("idleTimeout", 300);

            switch (platformName)
            {
                case "Android":
                    return new AndroidDriver<AppiumWebElement>(
                        new Uri(url), options, TimeSpan.FromMinutes(5));
                case "iOS":
                    return new IOSDriver<AppiumWebElement>(
                        new Uri(url), options, TimeSpan.FromMinutes(5));
                default:
                    return null;
            }
        }
    }
}