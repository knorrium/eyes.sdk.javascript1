package com.applitools.eyes;

import com.applitools.eyes.logging.ClientEvent;
import com.applitools.eyes.logging.TraceLevel;
import org.apache.commons.lang3.tuple.Pair;

/**
 * Handles log messages produces by the Eyes API.
 */
public abstract class LogHandler {

    protected final TraceLevel minLevel;

    public LogHandler(TraceLevel minLevel) {
        this.minLevel = minLevel;
    }

    public abstract void open();

    public void onMessage(ClientEvent event) {
        if (event.getLevel().isHigherThan(minLevel)) {
            onMessageInner(event);
        }
    }

    public abstract void onMessageInner(ClientEvent event);

    public abstract void close();

    public abstract boolean isOpen();
}
