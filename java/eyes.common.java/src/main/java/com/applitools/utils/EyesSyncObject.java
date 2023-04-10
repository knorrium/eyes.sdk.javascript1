package com.applitools.utils;

import com.applitools.eyes.Logger;
import com.applitools.eyes.logging.Stage;
import com.applitools.eyes.logging.TraceLevel;
import org.apache.commons.lang3.tuple.Pair;

import java.util.HashSet;

public class EyesSyncObject {

    private static final int WAIT_TIMEOUT = 60 * 1000;

    private boolean isNotified = false;
    private final Logger logger;
    private String id;
    private int timeWaited = 0;


    public EyesSyncObject(Logger logger, String id) {
        this.logger = logger;
        this.id = id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean isNotified() {
        return isNotified;
    }

    public void waitForNotify() throws InterruptedException {
        if (isNotified) {
            return;
        }

        while (true) {
            wait(WAIT_TIMEOUT);
            if (isNotified) {
                return;
            }

            timeWaited += WAIT_TIMEOUT;
            String message = String.format("Waiting for %dms on object %s", timeWaited, id);
            if (logger != null) {
                logger.log(TraceLevel.Warn, new HashSet<String>(), Stage.GENERAL, null, message);
            } else {
                System.out.println(message);
            }
        }
    }

    public void notifyObject() {
        isNotified = true;
        notifyAll();
    }
}
