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

        public const string SauceServerUrl = "https://ondemand.us-west-1.saucelabs.com:443/wd/hub";

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

    }
}
