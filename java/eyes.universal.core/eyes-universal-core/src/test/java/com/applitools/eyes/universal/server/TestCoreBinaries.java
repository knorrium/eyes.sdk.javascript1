package com.applitools.eyes.universal.server;

import com.applitools.eyes.universal.utils.SystemInfo;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * used in GitHub actions in core binaries tests.
 */
public class TestCoreBinaries {

    @Test
    public void testAlpineBinaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.getCurrentBinary(), "core-alpine");
    }

    @Test
    public void testArm64Binaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.getCurrentBinary(), "core-linux-arm64");
    }

    @Test
    public void testLinuxBinaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.getCurrentBinary(), "core-linux");
    }

    @Test
    public void testMacosBinaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.getCurrentBinary(), "core-macos");
    }

    @Test
    public void testWindowsBinaries() {
        UniversalSdkNativeLoader.start();
        Integer port = UniversalSdkNativeLoader.getPort();
        Assert.assertNotNull(port);
        Assert.assertEquals(SystemInfo.getCurrentBinary(), "core-win.exe");
    }
}