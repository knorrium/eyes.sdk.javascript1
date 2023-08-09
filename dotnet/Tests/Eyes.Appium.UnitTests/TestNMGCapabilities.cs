using System;
using Applitools;
using Applitools.Utils;
using NUnit.Framework;
using OpenQA.Selenium.Appium;

namespace Eyes.Appium.UnitTests
{
    public class TestMobileCapabilities
    {
        private const string API_KEY = "asd123";
        private const string SERVER_URL = "https://eyesapi.applitools.com";
        private static ProxySettings proxySettings = new ProxySettings("http://127.0.0.1", 8888);

        private const string LIBRARY_PATH =
            "@executable_path/Frameworks/Applitools_iOS.xcframework/ios-arm64/Applitools_iOS.framework/Applitools_iOS";
        private const string SIM_LIBRARY_PATH =
            "@executable_path/Frameworks/Applitools_iOS.xcframework/ios-arm64_x86_64-simulator/Applitools_iOS.framework/Applitools_iOS";

        [Test]
        public void TestAndroidMobileCaps()
        {
            var caps = GetCaps();

            Applitools.Appium.Eyes.SetMobileCapabilities(caps, API_KEY, SERVER_URL, proxySettings);
            
            caps.ToDictionary().TryGetValue("optionalIntentArguments", out object androidArgs);
            Assert.NotNull(androidArgs);
            Assert.IsInstanceOf<string>(androidArgs);

            string[] androidIntentArguments = ((string)androidArgs).Split(" ", 3);
            Assert.AreEqual(androidIntentArguments[0], "--es");
            Assert.AreEqual(androidIntentArguments[1], "APPLITOOLS");
            Assert.AreEqual(androidIntentArguments[2],
                $"'{{\"APPLITOOLS_API_KEY\":\"{API_KEY}\",\"APPLITOOLS_SERVER_URL\":\"{SERVER_URL}\",\"APPLITOOLS_PROXY_URL\":\"{proxySettings}\"}}'");
        }

        [Test]
        public void TestIosMobileCaps()
        {
            var caps = GetCaps();

            Applitools.Appium.Eyes.SetMobileCapabilities(caps, API_KEY, SERVER_URL, proxySettings);

            caps.ToDictionary().TryGetValue("processArguments", out object iosArgs);
            Assert.NotNull(iosArgs);
            Assert.IsInstanceOf<string>(iosArgs);

            string[] iosIntentArguments = ((string)iosArgs).Split(" ", 3);
            Assert.AreEqual(iosIntentArguments[0], "{\"args\":");
            Assert.AreEqual(iosIntentArguments[1], "[],");

            Assert.AreEqual(iosIntentArguments[2],
                $"\"env\":{{\"DYLD_INSERT_LIBRARIES\":\"{LIBRARY_PATH}:{SIM_LIBRARY_PATH}\",\"APPLITOOLS_API_KEY\":\"{API_KEY}\",\"APPLITOOLS_SERVER_URL\":\"{SERVER_URL}\",\"APPLITOOLS_PROXY_URL\":\"{proxySettings}\"}}}}");

            var expectedObj = new
            {
                deviceName = "Google Pixel 5 GoogleAPI Emulator", 
                deviceOrientation="portrait",
                platformVersion="11.0",
                platformName= "Android",
                automationName="UiAutomator2",
                optionalIntentArguments= "--es APPLITOOLS '{\"APPLITOOLS_API_KEY\":\"asd123\",\"APPLITOOLS_SERVER_URL\":\"https://eyesapi.applitools.com\",\"APPLITOOLS_PROXY_URL\":\"http://127.0.0.1:8888/\"}'",
                processArguments="{\"args\": [], \"env\":{\"DYLD_INSERT_LIBRARIES\":\"@executable_path/Frameworks/Applitools_iOS.xcframework/ios-arm64/Applitools_iOS.framework/Applitools_iOS:@executable_path/Frameworks/Applitools_iOS.xcframework/ios-arm64_x86_64-simulator/Applitools_iOS.framework/Applitools_iOS\",\"APPLITOOLS_API_KEY\":\"asd123\",\"APPLITOOLS_SERVER_URL\":\"https://eyesapi.applitools.com\",\"APPLITOOLS_PROXY_URL\":\"http://127.0.0.1:8888/\"}}"
            };
            var capsAsDict = caps.ToDictionary();
            Assert.AreEqual(expectedObj.ToJson(), capsAsDict.ToJson());
        }

        [Test]
        public void TestDefaultsFromEnv()
        {
            var caps = GetCaps();

            const string FAKE_API_KEY = "MY_API_KEY_123";
            const string FAKE_SERVER_URL = "applitools-server!";
            const string FAKE_PROXY_URI = "user:pass@myproxy.applitools.com";

            Environment.SetEnvironmentVariable("APPLITOOLS_API_KEY", FAKE_API_KEY);
            Environment.SetEnvironmentVariable("APPLITOOLS_SERVER_URL", FAKE_SERVER_URL);
            Environment.SetEnvironmentVariable("APPLITOOLS_HTTP_PROXY", FAKE_PROXY_URI);

            Applitools.Appium.Eyes.SetMobileCapabilities(caps);
            
            caps.ToDictionary().TryGetValue("optionalIntentArguments", out object androidArgs);
            Assert.NotNull(androidArgs);
            Assert.IsInstanceOf<string>(androidArgs);

            string[] androidIntentArguments = ((string)androidArgs).Split(" ", 3);
            Assert.AreEqual(androidIntentArguments[0], "--es");
            Assert.AreEqual(androidIntentArguments[1], "APPLITOOLS");
            Assert.AreEqual(androidIntentArguments[2],
                $"'{{\"APPLITOOLS_API_KEY\":\"{FAKE_API_KEY}\",\"APPLITOOLS_SERVER_URL\":\"{FAKE_SERVER_URL}\",\"APPLITOOLS_PROXY_URL\":\"{FAKE_PROXY_URI}\"}}'");
        }

        private AppiumOptions GetCaps()
        {
            var caps = new AppiumOptions();
            caps.AddAdditionalCapability("deviceName", "Google Pixel 5 GoogleAPI Emulator");
            caps.AddAdditionalCapability("deviceOrientation", "portrait");
            caps.AddAdditionalCapability("platformVersion", "11.0");
            caps.AddAdditionalCapability("platformName", "Android");
            caps.AddAdditionalCapability("automationName", "UiAutomator2");

            return caps;
        }
    }
}
