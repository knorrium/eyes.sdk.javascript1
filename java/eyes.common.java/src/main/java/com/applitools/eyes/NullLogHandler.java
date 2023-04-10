package com.applitools.eyes;

import com.applitools.eyes.logging.ClientEvent;
import com.applitools.eyes.logging.TraceLevel;

/**
 * Ignores all log messages.
 */
public class NullLogHandler extends LogHandler {

    public static final NullLogHandler instance = new NullLogHandler();

    public NullLogHandler() {
        super(TraceLevel.Notice);
    }

    @Override
    public void onMessageInner(ClientEvent event) {
    }

    public void open() {
    }

    public void close() {
    }

    @Override
    public boolean isOpen() {
        return true;
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof NullLogHandler;
    }
}