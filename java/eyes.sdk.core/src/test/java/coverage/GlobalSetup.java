package coverage;


import com.applitools.eyes.BatchInfo;
import com.applitools.utils.ArgumentGuard;
import coverage.exceptions.MissingEnvVarException;
import org.testng.annotations.BeforeSuite;

public class GlobalSetup {

    protected static BatchInfo batch;
    protected static String apiKey;
    protected static String readApiKey;
    public static boolean useDocker;
    public static boolean CI;
    public static String EG_URL;

    @BeforeSuite
    public void globalSetup() {
        String name = System.getenv("APPLITOOLS_BATCH_NAME");
        if (name == null) name = "JAVA coverage tests";
        batch = new BatchInfo(name);
        String id = System.getenv("APPLITOOLS_BATCH_ID");
        if (id != null) batch.setId(id);
        apiKey = System.getenv("APPLITOOLS_API_KEY");
        ArgumentGuard.notNull(apiKey, "apiKey");
        readApiKey = System.getenv("APPLITOOLS_API_KEY_READ");
        EG_URL = System.getenv("EXECUTION_GRID_URL");
        String CI = System.getenv("CI");
        GlobalSetup.CI = CI != null && CI.equals("true");
        useDocker = !GlobalSetup.CI;
        String envVar = System.getenv("USE_SELENIUM_DOCKER");
        if (envVar != null && envVar.equals("false")) {
            useDocker = false;
        }
        if(!useDocker) {
            String firefoxDriverPath = System.getenv("FIREFOX_DRIVER_PATH");
            if(firefoxDriverPath == null) throw new MissingEnvVarException("FIREFOX_DRIVER_PATH");
            System.setProperty("webdriver.gecko.driver", firefoxDriverPath);
        }


    }

}