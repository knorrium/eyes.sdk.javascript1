package com.applitools.eyes.universal.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LayoutBreakpointsDto {

    @JsonProperty("breakpoints")
    private Object breakpoints;

    @JsonProperty("reload")
    private Boolean reload;

    public Object getBreakpoints() {
        return breakpoints;
    }

    public void setBreakpoints(Object breakpoints) {
        this.breakpoints = breakpoints;
    }

    public Boolean getReload() {
        return reload;
    }

    public void setReload(Boolean reload) {
        this.reload = reload;
    }
}
