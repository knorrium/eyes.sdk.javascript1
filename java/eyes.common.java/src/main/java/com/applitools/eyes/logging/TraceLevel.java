package com.applitools.eyes.logging;

public enum TraceLevel {
    /**
     * Detailed implementation specific messages helpful for debugging (e.g., enter / exit function, etc.)
     **/
    Debug(0),

    /**
     * Verbose log messages that are normally not logged
     */
    Info(1),

    /**
     * Log messages indicating key steps in a workflow (use as sparsely as possible).
     */
    Notice(2),

    /**
     * Indicate failures that can be overcome, are expected or are transient
     * (e.g., bad user input, missing user input that can be replaced with a fallback, etc.)
     */
    Warn(3),

    /**
     * Indicate an unexpected error conditions that result with a failure to complete an operation.
     */
    Error(4);

    private final int level;

    TraceLevel(int level) {
        this.level = level;
    }

    /**
     * Checks if this level is high enough for logging.
     * @param minLevel The minimum level required for logging.
     */
    public boolean isHigherThan(TraceLevel minLevel) {
        return level >= minLevel.level;
    }
}
