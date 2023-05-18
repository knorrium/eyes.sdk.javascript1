package com.applitools.eyes.options;

import com.applitools.utils.ArgumentGuard;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class LayoutBreakpointsOptions {

    /**
     * use default layout breakpoints
     */
    private Boolean isLayoutBreakpoints;

    /**
     * explicit list of layout breakpoints
     */
    private final List<Integer> layoutBreakpoints = new ArrayList<>();

    /**
     * reload after layout breakpoints
     */
    private Boolean reload;

    public LayoutBreakpointsOptions breakpoints() {
        isLayoutBreakpoints = true;
        layoutBreakpoints.clear();
        return this;
    }

    public LayoutBreakpointsOptions breakpoints(Boolean shouldSet) {
        isLayoutBreakpoints = shouldSet;
        layoutBreakpoints.clear();
        return this;
    }

    public LayoutBreakpointsOptions breakpoints(int[] breakpoints) {
        return breakpoints(
                Arrays.stream(breakpoints).boxed().toArray(Integer[]::new)
        );
    }

    public LayoutBreakpointsOptions breakpoints(Integer... breakpoints) {
        isLayoutBreakpoints = null;
        layoutBreakpoints.clear();

        if (breakpoints == null || breakpoints.length == 0) {
            return this;
        }

        for (int breakpoint : breakpoints) {
            ArgumentGuard.greaterThanZero(breakpoint, "breakpoint");
            layoutBreakpoints.add(breakpoint);
        }

        Collections.sort(layoutBreakpoints);
        return this;
    }

    public LayoutBreakpointsOptions reload() {
        reload = true;
        return this;
    }
    public LayoutBreakpointsOptions reload(Boolean shouldReload) {
        reload = shouldReload;
        return this;
    }

    public Boolean getReload() {
        return reload;
    }

    public Boolean isLayoutBreakpoints() { return isLayoutBreakpoints; }

    public List<Integer> getLayoutBreakpoints() { return layoutBreakpoints; }

}
