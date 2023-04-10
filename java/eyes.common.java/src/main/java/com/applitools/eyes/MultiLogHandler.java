package com.applitools.eyes;

import com.applitools.eyes.logging.ClientEvent;
import com.applitools.eyes.logging.TraceLevel;

import java.util.*;

public class MultiLogHandler extends LogHandler {
    final Set<LogHandler> logHandlers = Collections.synchronizedSet(new HashSet<LogHandler>());

    public MultiLogHandler(LogHandler... logHandlers) {
        super(TraceLevel.Debug);
        if (logHandlers == null || logHandlers.length == 0) {
            return;
        }

        this.logHandlers.addAll(Arrays.asList(logHandlers));
    }

    public void addLogHandler(LogHandler logHandler) {
        logHandlers.add(logHandler);
    }

    public void clear() {
        logHandlers.clear();
    }

    @Override
    public void open() {
        synchronized (logHandlers) {
            for (LogHandler logHandler : logHandlers) {
                logHandler.open();
            }
        }
    }

    @Override
    public void onMessageInner(ClientEvent event) {
        synchronized (logHandlers) {
            for (LogHandler logHandler : logHandlers) {
                logHandler.onMessage(event);
            }
        }
    }

    @Override
    public void close() {
        synchronized (logHandlers) {
            for (LogHandler logHandler : logHandlers) {
                logHandler.close();
            }
        }
    }

    @Override
    public boolean isOpen() {
        return true;
    }
}
