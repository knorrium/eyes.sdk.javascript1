package com.applitools.eyes.appium;

import com.applitools.utils.EnvironmentVersions;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.appium.java_client.AppiumDriver;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AppiumEnvironmentVersions extends EnvironmentVersions {

    @JsonProperty("appium")
    public String getAppium() {
        Class<AppiumDriver> clazz = AppiumDriver.class;
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
