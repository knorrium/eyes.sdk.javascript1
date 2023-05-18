package com.applitools.eyes.unit;

import com.applitools.eyes.metadata.DeviceNames;
import com.applitools.eyes.utils.TestUtils;
import com.applitools.eyes.visualgrid.model.DeviceName;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.*;

public class TestDeviceName {

    private final List<String> exclusions = new ArrayList<String>() {{
        add("Galaxy S III");
        add("Galaxy Note II");
        add("Samsung Galaxy A5");
        add("Samsung Galaxy S8");
    }};

    @Test
    public void test() {
        HashMap<String, DeviceNames> names = TestUtils.getDeviceNames();

        for (Map.Entry<String, DeviceNames> device : names.entrySet()) {
            String deviceName = device.getKey();
            DeviceName sdkDeviceName = DeviceName.fromName(deviceName);

            if (sdkDeviceName == null) {
                if (exclusions.contains(deviceName)) {
                    continue;
                }
                String failMessage = "Device \"" + deviceName + "\" is missing in the SDK!";
                Assert.fail(failMessage);
            }

            Assert.assertEquals(deviceName, sdkDeviceName.getName());
        }
    }

}
