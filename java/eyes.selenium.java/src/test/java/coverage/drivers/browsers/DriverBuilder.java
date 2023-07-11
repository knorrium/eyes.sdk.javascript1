package coverage.drivers.browsers;

import org.openqa.selenium.WebDriver;

import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.List;

public class DriverBuilder {

    protected boolean headless = true;
    protected boolean legacy = false;
    protected boolean executionGrid = false;
    protected String browser = "chrome";
    protected String device;
    protected String emulator;
    private List<String> args;

    static HashMap<String, Builder> browserBuilders = new HashMap<String, Builder>()
    {{
        put("chrome", new ChromeBuilder());
        put("firefox", new FirefoxBuilder());
        put("safari-11", new Safari11Builder());
        put("safari-12", new Safari12Builder());
        put("ie-11", new InternetExplorer11Builder());
        put("edge-18", new Edge18Builder());
        put("firefox-48", new Firefox48Builder());
    }};

    static HashMap<String, DeviceBuilder> deviceBuilders = new HashMap<String, DeviceBuilder>()
    {{
        put("iPhone XS", new IPhoneXS());
        put("Pixel 3a XL", new Pixel3aXL());
    }};

    static HashMap<String, DeviceBuilder> emulatorBuilders = new HashMap<String, DeviceBuilder>()
    {{
        put("Android 8.0", new ChromeEmulatorBuilder());
    }};

    public DriverBuilder headless(boolean headless) {
        this.headless = headless;
        return this;
    }

    public DriverBuilder browser(String browser) {
        this.browser = browser;
        return this;
    }

    public DriverBuilder device(String device) {
        this.device = device;
        return this;
    }

    public DriverBuilder emulator(String emulator) {
        this.emulator = emulator;
        return this;
    }

    public DriverBuilder args(List<String> args) {
        this.args = args;
        return this;
    }

    public DriverBuilder legacy(boolean legacy) {
        this.legacy = legacy;
        return this;
    }

    public DriverBuilder executionGrid(boolean executionGrid) {
        this.executionGrid = executionGrid;
        return this;
    }

    public WebDriver build() throws MalformedURLException {
        if (device == null && emulator == null) {
            Builder builder = browserBuilders.get(browser);
            return builder.build(headless, legacy, executionGrid);
        } else {
            DeviceBuilder builder = emulator == null ? deviceBuilders.get(device) : emulatorBuilders.get(emulator);
            builder.browser(browser);
            return builder.build(headless, legacy, executionGrid, args);
        }

    }
}
