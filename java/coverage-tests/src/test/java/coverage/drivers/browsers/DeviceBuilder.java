package coverage.drivers.browsers;

import org.openqa.selenium.WebDriver;

import java.net.MalformedURLException;
import java.util.List;

public interface DeviceBuilder {
    void browser(String browser);
    WebDriver build(boolean headless, boolean legacy, boolean executionGrid, List<String> args) throws MalformedURLException;
}
