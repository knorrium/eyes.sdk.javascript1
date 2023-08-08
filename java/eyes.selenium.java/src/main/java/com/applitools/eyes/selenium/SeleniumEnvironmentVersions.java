package com.applitools.eyes.selenium;

import com.applitools.utils.EnvironmentVersions;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.openqa.selenium.WebDriver;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SeleniumEnvironmentVersions extends EnvironmentVersions {

    @JsonProperty("selenium")
    public String getSelenium() {
        Class<WebDriver> clazz = WebDriver.class;
        String className = clazz.getSimpleName() + ".class";
        String classPath = clazz.getResource(className).toString();
        if (classPath.startsWith("jar")) {
            Pattern pattern = Pattern.compile("\\d+\\.\\d+\\.\\d+");
            Matcher matcher = pattern.matcher(classPath);
            if (matcher.find()) {
                return matcher.group();
            }
        }

        return null;
    }
}
