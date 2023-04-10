package com.applitools.eyes.positioning;

import com.applitools.eyes.Region;
import com.applitools.eyes.fluent.ICheckSettingsInternal;

/**
 * Encapsulates a getRegion "callback" and how the region's coordinates should be used.
 */
public class RegionProvider {

    /**
     * @return A region with "as is" viewport coordinates.
     */
    public Region getRegion(ICheckSettingsInternal settings) {
        return getRegion();
    }

    public Region getRegion() {return Region.EMPTY; }

    public static final RegionProvider NULL_INSTANCE = new RegionProvider();
}
