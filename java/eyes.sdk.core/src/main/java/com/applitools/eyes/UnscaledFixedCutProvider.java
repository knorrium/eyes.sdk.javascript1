package com.applitools.eyes;

import com.applitools.utils.ArgumentGuard;

/**
 * Cut provider based on fixed cut values, run BEFORE scaling.
 */
public class UnscaledFixedCutProvider extends FixedCutProvider {
    private Logger logger = new Logger();

    /**
     * @param header The header to cut in pixels.
     * @param footer The footer to cut in pixels.
     * @param left   The left to cut in pixels.
     * @param right  The right to cut in pixels.
     */
    @SuppressWarnings("WeakerAccess")
    public UnscaledFixedCutProvider(int header, int footer, int left, int right) {
        super(header, footer, left, right);
    }

    public void setLogger(Logger logger) {
        ArgumentGuard.notNull(logger, "logger");
        this.logger = logger;
    }

    public CutProvider scale(double scaleRatio) {
        if (this instanceof NullCutProvider) {
            return this;
        }
        UnscaledFixedCutProvider cutProvider = new UnscaledFixedCutProvider(header, footer, left, right);
        cutProvider.logger = logger;
        return cutProvider;
    }
}
