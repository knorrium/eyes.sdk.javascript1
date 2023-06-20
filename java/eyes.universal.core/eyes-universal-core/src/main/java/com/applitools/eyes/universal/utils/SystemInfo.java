package com.applitools.eyes.universal.utils;

import com.applitools.eyes.EyesException;
import com.applitools.utils.GeneralUtils;

import java.nio.file.Files;
import java.nio.file.Paths;

public class SystemInfo {
    private static final String ALPINE_PATH = "/etc/alpine-release";

    public static String getCurrentBinary() {
        String osVersion = GeneralUtils.getPropertyString("os.name").toLowerCase();
        String osArchitecture = GeneralUtils.getPropertyString("os.arch").toLowerCase();

        String suffix;

        if (osVersion.contains("windows")) {
            suffix = "win.exe";
        } else if (osVersion.contains("mac")) {
            suffix = "macos";
        } else if (osVersion.contains("linux")) {
            suffix = "linux";
            if (Files.exists(Paths.get(ALPINE_PATH))) {
                suffix = "alpine";
            } else if (osArchitecture.contains("arm64") || osArchitecture.contains("aarch64")) {
                suffix = "linux-arm64";
            }
        } else {
            throw new EyesException(String.format("Operating system is not supported. Version: %s, Architecture: %s",
                    osVersion,
                    osArchitecture));
        }

        return String.format("core-%s", suffix);
    }
}
