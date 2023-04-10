package com.applitools.eyes.scaling;

import com.applitools.eyes.Logger;

/**
 * A scale provider which does nothing.
 */
public class NullScaleProvider extends FixedScaleProvider {

    public NullScaleProvider(Logger logger) {
        super(logger, 1);
    }
}
