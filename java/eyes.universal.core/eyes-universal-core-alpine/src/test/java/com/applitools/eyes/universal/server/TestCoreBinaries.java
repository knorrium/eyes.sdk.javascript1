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
}