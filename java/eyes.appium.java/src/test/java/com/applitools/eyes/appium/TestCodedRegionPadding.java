package com.applitools.eyes.appium;

import com.applitools.eyes.Padding;
import com.applitools.eyes.Region;
import com.applitools.eyes.TestResults;
import com.applitools.eyes.appium.android.AndroidTestSetup;
import com.applitools.eyes.metadata.SessionResults;
import com.applitools.eyes.utils.TestUtils;
import io.appium.java_client.AppiumBy;
import io.appium.java_client.MobileBy;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.net.MalformedURLException;
import java.net.URL;

public class TestCodedRegionPadding extends AndroidTestSetup {

    @Test
    public void testRegionPadding() throws InterruptedException {
        eyes.open(driver, "Java Appium - Android", "Test Regions Padding");

        driver.findElement(AppiumBy.id("btn_two_fragments_activity")).click();
        Thread.sleep(1000);
        WebElement item1 = driver.findElement(AppiumBy.id("id_2"));
        WebElement item2 = driver.findElement(AppiumBy.id("id_4"));
        WebElement item3 = driver.findElement(AppiumBy.id("id_6"));
        WebElement item4 = driver.findElement(AppiumBy.id("id_8"));

        eyes.check(Target.window()
//                .ignore(item1, new Padding().setBottom(20))
//                .layout(item2, new Padding(20))
//                .content(item3, new Padding().setLeft(10).setRight(10))
//                .strict(item4, new Padding().setBottom(40))
                .fully(false));
        final TestResults result = eyes.close(false);
        final SessionResults info = getTestInfo(result);

        Region ignoreRegion = info.getActualAppOutput()[0].getImageMatchSettings().getIgnore()[0];
        Region layoutRegion = info.getActualAppOutput()[0].getImageMatchSettings().getLayout()[0];
        Region contentRegion = info.getActualAppOutput()[0].getImageMatchSettings().getContent()[0];
        Region strictRegion = info.getActualAppOutput()[0].getImageMatchSettings().getStrict()[0];

        Assert.assertEquals(ignoreRegion, new Region(16, 68, 361, 52), "ignore");
        Assert.assertEquals(layoutRegion, new Region(0, 151, 401, 72), "layout");
        Assert.assertEquals(contentRegion, new Region(6, 274, 381, 32), "content");
        Assert.assertEquals(strictRegion, new Region(16, 377, 361, 72), "strict");
    }

}
