package com.applitools.eyes.universal.server;

import com.applitools.eyes.universal.utils.SystemInfo;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * used in GitHub actions in various core binaries tests.
 */
public class TestCoreBinaries {

    @Test
    public void testMacosBinaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.CURRENT_CORE_BINARY, "core-macos");
    }

    @Test
    public void testWindowsBinaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.CURRENT_CORE_BINARY, "core-win.exe");
    }

    @Test
    public void testLinuxBinaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.CURRENT_CORE_BINARY, "core-linux");
    }

    @Test
    public void testAlpineBinaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.CURRENT_CORE_BINARY, "core-alpine");
    }

    @Test
    public void testArm64Binaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.CURRENT_CORE_BINARY, "core-linux-arm64");
    }

}