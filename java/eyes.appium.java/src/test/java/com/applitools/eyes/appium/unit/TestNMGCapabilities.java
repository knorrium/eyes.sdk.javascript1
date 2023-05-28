package com.applitools.eyes.appium.unit;

import com.applitools.eyes.ProxySettings;
import com.applitools.eyes.appium.Eyes;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TestNMGCapabilities {

    @Test
    public void testProxyInCapabilities() {
        DesiredCapabilities capabilities = new DesiredCapabilities();
        ProxySettings proxySettings = new ProxySettings("http://127.0.0.1:1234");
        Eyes.setNMGCapabilities(capabilities, "apiKey", "serverUrl", proxySettings);

        String expected = "{optionalIntentArguments=--es APPLITOOLS '{\"NML_API_KEY\":\"apiKey\",\"NML_SERVER_URL\":\"serverUrl\",\"NML_PROXY_URL\":\"http://127.0.0.1:1234\"}', processArguments={\"args\": [], \"env\":{\"DYLD_INSERT_LIBRARIES\":\"@executable_path/Frameworks/UFG_lib.xcframework/ios-arm64/UFG_lib.framework/UFG_lib:@executable_path/Frameworks/UFG_lib.xcframework/ios-arm64_x86_64-simulator/UFG_lib.framework/UFG_lib\",\"NML_API_KEY\":\"apiKey\",\"NML_SERVER_URL\":\"serverUrl\",\"NML_PROXY_URL\":\"http://127.0.0.1:1234\"}}}";
        Assert.assertEquals(expected, capabilities.asMap().toString());
    }
}
