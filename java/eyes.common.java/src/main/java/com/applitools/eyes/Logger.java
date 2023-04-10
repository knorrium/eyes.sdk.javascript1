package com.applitools.eyes;

import com.applitools.eyes.logging.*;
import com.applitools.utils.GeneralUtils;
import org.apache.commons.lang3.tuple.Pair;

import java.util.*;

/**
 * Logs trace messages.
 */
public class Logger {
    private final MultiLogHandler logHandler;
    private String agentId;

    public Logger() {
        logHandler = new MultiLogHandler();
    }

    public Logger(LogHandler handler) {
        this();
        logHandler.addLogHandler(handler);
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    /**
     * @return The currently set log handler.
     */
    public LogHandler getLogHandler() {
        return logHandler;
    }

    /**
     * Sets the log handler.
     *
     * @param handler The log handler to set. If you want a log handler which
     *                does nothing, use {@link
     *                com.applitools.eyes.NullLogHandler}.
     */
    public void setLogHandler(LogHandler handler) {
        if (handler == null) {
            logHandler.clear();
        } else {
            logHandler.addLogHandler(handler);
        }
    }

    @SafeVarargs
    public final void log(String testId, Stage stage, Pair<String, ?>... data) {
        logInner(TraceLevel.Notice, testId == null ? null : Collections.singleton(testId), stage, null, data);
    }

    @SafeVarargs
    public final void log(Set<String> testIds, Stage stage, Pair<String, ?>... data) {
        logInner(TraceLevel.Notice, testIds, stage, null, data);
    }

    @SafeVarargs
    public final void log(String testId, Stage stage, Type type, Pair<String, ?>... data) {
        logInner(TraceLevel.Notice, testId == null ? null : Collections.singleton(testId), stage, type, data);
    }

    @SafeVarargs
    public final void log(Set<String> testIds, Stage stage, Type type, Pair<String, ?>... data) {
        logInner(TraceLevel.Notice, testIds, stage, type, data);
    }

    @SafeVarargs
    public final void log(TraceLevel level, String testId, Stage stage, Pair<String, ?>... data) {
        logInner(level, testId == null ? null : Collections.singleton(testId), stage, null, data);
    }

    @SafeVarargs
    public final void log(TraceLevel level, Set<String> testIds, Stage stage, Type type, Pair<String, ?>... data) {
        logInner(level, testIds, stage, type, data);
    }

    @SafeVarargs
    public final void log(TraceLevel level, Stage stage, Type type, Pair<String, ?>... data) {
        logInner(level, null, stage, type, data);
    }

    @SafeVarargs
    public final void log(TraceLevel level, Stage stage, Pair<String, ?>... data) {
        logInner(level, null, stage, null, data);
    }

    public final void log(TraceLevel level, Set<String> testIds, Stage stage, Type type, String message) {
        logInner(level, testIds, stage, type, Pair.of("message", message));
    }

    public final void log(TraceLevel level, String testId, Stage stage, Type type, String message) {
        logInner(level, testId == null ? null : Collections.singleton(testId), stage, type, Pair.of("message", message));
    }

    public final void log(TraceLevel level, String testId, Stage stage, String message) {
        logInner(level, testId == null ? null : Collections.singleton(testId), stage, null, Pair.of("message", message));
    }

    public final void log(TraceLevel level, Stage stage, String message) {
        logInner(level, null, stage, null, Pair.of("message", message));
    }

    public final void log(String testId, Stage stage, String message) {
        logInner(TraceLevel.Notice, testId == null ? null : Collections.singleton(testId), stage, null, Pair.of("message", message));
    }

    @SafeVarargs
    private final void logInner(TraceLevel level, Set<String> testIds, Stage stage, Type type, Pair<String, ?>... data) {
        String currentTime = GeneralUtils.toISO8601DateTime(Calendar.getInstance(TimeZone.getTimeZone("UTC")));
        ClientEvent event = new ClientEvent(currentTime, createMessageFromLog(testIds, stage, type, 4, data), level);
        logHandler.onMessage(event);
    }

    @SafeVarargs
    private final Message createMessageFromLog(Set<String> testIds, Stage stage, Type type, int methodsBack, Pair<String, ?>... data) {
        Map<String, Object> map = new HashMap<>();
        if (data != null && data.length > 0) {
            for (Pair<String, ?> pair : data) {
                map.put(pair.getLeft(), pair.getRight());
            }
        }

        StackTraceElement[] stackTraceElements =
                Thread.currentThread().getStackTrace();
        String stackTrace = "";
        if (stackTraceElements.length > methodsBack) {
            stackTrace += stackTraceElements[methodsBack].getClassName() + "." + stackTraceElements[methodsBack].getMethodName() + "()";
        }

        return new Message(agentId, stage, type, testIds, Thread.currentThread().getId(), stackTrace, map);
    }

    @SafeVarargs
    public final Message createMessageFromLog(Set<String> testIds, Stage stage, Type type, Pair<String, ?>... data) {
        return createMessageFromLog(testIds, stage, type, 3, data);
    }
}
