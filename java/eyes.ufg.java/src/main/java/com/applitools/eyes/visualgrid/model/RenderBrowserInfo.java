package com.applitools.eyes.visualgrid.model;

import com.applitools.eyes.RectangleSize;
import com.applitools.eyes.selenium.BrowserType;

public class RenderBrowserInfo implements IRenderingBrowserInfo {

    private RectangleSize viewportSize;
    private BrowserType browserType;
    private String platform = "linux";
    private EmulationBaseInfo emulationInfo;
    private IosDeviceInfo iosDeviceInfo;
    private final String sizeMode = "full-page";
    private String baselineEnvName;
    private AndroidDeviceInfo androidDeviceInfo;

    /** internal */
    private String deviceVersion;

    public RenderBrowserInfo(RectangleSize viewportSize, BrowserType browserType, String baselineEnvName) {
        this.viewportSize = viewportSize;
        this.browserType = browserType;
        this.baselineEnvName = baselineEnvName;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(RectangleSize viewportSize, BrowserType browserType) {
        this.viewportSize = viewportSize;
        this.browserType = browserType;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(EmulationBaseInfo emulationInfo, String baselineEnvName) {
        this.emulationInfo = emulationInfo;
        this.baselineEnvName = baselineEnvName;
        this.browserType = BrowserType.CHROME;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(int width, int height) {
        this(new RectangleSize(width, height), BrowserType.CHROME, null);
    }

    public RenderBrowserInfo(EmulationBaseInfo emulationInfo) {
        this.emulationInfo = emulationInfo;
        this.browserType = BrowserType.CHROME;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(int width, int height, BrowserType browserType, String baselineEnvName) {
        this(new RectangleSize(width, height), browserType, baselineEnvName);
    }

    public RenderBrowserInfo(int width, int height, BrowserType browserType) {
        this(new RectangleSize(width, height), browserType, null);
    }

    public RenderBrowserInfo(IosDeviceInfo deviceInfo) {
        this.iosDeviceInfo = deviceInfo;
        this.browserType = BrowserType.SAFARI;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(String version, IosDeviceInfo deviceInfo) {
        this.iosDeviceInfo = deviceInfo;
        this.deviceVersion = version;
        this.browserType = BrowserType.SAFARI;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(IosDeviceInfo deviceInfo, String baselineEnvName) {
        this.iosDeviceInfo = deviceInfo;
        this.baselineEnvName = baselineEnvName;
        this.browserType = BrowserType.SAFARI;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(AndroidDeviceInfo deviceInfo) {
        this.androidDeviceInfo = deviceInfo;
        this.browserType = BrowserType.CHROME;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(String version, AndroidDeviceInfo deviceInfo) {
        this.androidDeviceInfo = deviceInfo;
        this.deviceVersion = version;
        this.browserType = BrowserType.CHROME;
        this.platform = getPlatform();
    }

    public RenderBrowserInfo(AndroidDeviceInfo deviceInfo, String baselineEnvName) {
        this.androidDeviceInfo = deviceInfo;
        this.baselineEnvName = baselineEnvName;
        this.browserType = BrowserType.CHROME;
        this.platform = getPlatform();
    }

    public RectangleSize getDeviceSize() {
        if (viewportSize != null) {
            return viewportSize;
        }

        if (emulationInfo != null && emulationInfo.size != null) {
            return emulationInfo.size;
        }

        if (iosDeviceInfo != null && iosDeviceInfo.size != null) {
            return iosDeviceInfo.size;
        }

        if (androidDeviceInfo != null && androidDeviceInfo.size != null) {
            return androidDeviceInfo.size;
        }

        return RectangleSize.EMPTY;
    }

    public void setEmulationDeviceSize(DeviceSize size) {
        if (size != null && emulationInfo != null) {
            if (emulationInfo.screenOrientation.equals(ScreenOrientation.PORTRAIT)) {
                emulationInfo.size = size.getPortrait();
            } else {
                emulationInfo.size = size.getLandscape();
            }
        }
    }

    public void setIosDeviceSize(DeviceSize size) {
        if (size != null && iosDeviceInfo != null) {
            if (iosDeviceInfo.getScreenOrientation().equals(ScreenOrientation.PORTRAIT)) {
                iosDeviceInfo.size = size.getPortrait();
            } else {
                iosDeviceInfo.size = size.getLandscape();
            }
        }
    }

    public int getWidth() {
        if (viewportSize != null) {
            return viewportSize.getWidth();
        }
        return 0;
    }

    public int getHeight() {
        if (viewportSize != null) {
            return viewportSize.getHeight();
        }
        return 0;
    }

    public RectangleSize getViewportSize() {
        return viewportSize;
    }

    public BrowserType getBrowserType() {
        return this.browserType;
    }

    public String getPlatform() {
        if (iosDeviceInfo != null) {
            return "ios";
        }

        if (androidDeviceInfo != null) {
            return "android";
        }

        if (browserType != null) {
            switch (this.browserType) {
                case CHROME:
                case CHROME_ONE_VERSION_BACK:
                case CHROME_TWO_VERSIONS_BACK:
                case FIREFOX:
                case FIREFOX_ONE_VERSION_BACK:
                case FIREFOX_TWO_VERSIONS_BACK:
                    return "linux";
                case SAFARI:
                case SAFARI_ONE_VERSION_BACK:
                case SAFARI_TWO_VERSIONS_BACK:
                    return "mac os x";
                case IE_10:
                case IE_11:
                case EDGE:
                case EDGE_LEGACY:
                case EDGE_CHROMIUM:
                case EDGE_CHROMIUM_ONE_VERSION_BACK:
                    return "windows";
            }
        }
        return "linux";
    }

    public EmulationBaseInfo getEmulationInfo() {
        return emulationInfo;
    }

    public IosDeviceInfo getIosDeviceInfo() {
        return iosDeviceInfo;
    }

    public AndroidDeviceInfo getAndroidDeviceInfo() {
        return androidDeviceInfo;
    }

    public String getSizeMode() {
        return this.sizeMode;
    }

    public void setViewportSize(RectangleSize viewportSize) {
        this.viewportSize = viewportSize;
    }

    public String getBaselineEnvName() {
        return baselineEnvName;
    }

    public String getDeviceVersion() {
        return deviceVersion;
    }

    @Override
    public String toString() {
        return "RenderBrowserInfo{" +
                "viewportSize=" + viewportSize +
                ", browserType=" + browserType +
                ", platform='" + platform + '\'' +
                ", emulationInfo=" + emulationInfo +
                ", iosDeviceInfo=" + iosDeviceInfo +
                ", sizeMode='" + sizeMode + '\'' +
                ", baselineEnvName='" + baselineEnvName + '\'' +
                ", androidDeviceInfo=" + androidDeviceInfo +
                '}';
    }
}