package com.applitools.eyes.playwright;

import com.applitools.utils.EnvironmentVersions;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.microsoft.playwright.Playwright;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PlaywrightEnvironmentVersions extends EnvironmentVersions {

    @JsonProperty("playwright")
    public String getPlaywright() {
        Class<Playwright> clazz = Playwright.class;
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
