package com.applitools.eyes.universal.mapper;

import com.applitools.eyes.options.LayoutBreakpointsOptions;
import com.applitools.eyes.universal.dto.LayoutBreakpointsDto;

public class LayoutBreakpointsMapper {

    public static LayoutBreakpointsDto toLayoutBreakpointsDto(LayoutBreakpointsOptions layoutBreakpointsOptions) {
        if (layoutBreakpointsOptions == null) {
            return null;
        }

        Object breakpoints = layoutBreakpointsOptions.isLayoutBreakpoints() != null ? layoutBreakpointsOptions.isLayoutBreakpoints() :
                layoutBreakpointsOptions.getLayoutBreakpoints().isEmpty() ? null : layoutBreakpointsOptions.getLayoutBreakpoints();
        if (breakpoints == null) {
            return null;
        }

        LayoutBreakpointsDto dto = new LayoutBreakpointsDto();
        dto.setBreakpoints(breakpoints);
        dto.setReload(layoutBreakpointsOptions.getReload());

        return dto;
    }
}
