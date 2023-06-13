package com.applitools.eyes.universal.utils;

import java.io.IOException;
import java.util.Properties;

public class SystemInfo {

    private static final Properties properties = new Properties();

    static {
        try {
            properties.load(SystemInfo.class.getClassLoader().getResourceAsStream("core.binaries"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static final String CURRENT_CORE_BINARY = properties.getProperty("applitools_core_binaries");
}
