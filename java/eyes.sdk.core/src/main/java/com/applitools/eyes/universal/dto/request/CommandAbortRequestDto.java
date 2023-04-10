package com.applitools.eyes.universal.dto.request;

import com.applitools.eyes.universal.Reference;
import com.applitools.eyes.universal.dto.CloseSettingsDto;

/**
 * command abort request dto
 */
public class CommandAbortRequestDto {

    /**
     * reference received from "Core.openEyes" command
     */
    private Reference eyes;

    /**
     * close settings
     */
    private CloseSettingsDto settings;

    public CommandAbortRequestDto() {
    }

    public CommandAbortRequestDto(Reference eyes, CloseSettingsDto settings) {
        this.eyes = eyes;
        this.settings = settings;
    }

    public Reference getEyes() {
        return eyes;
    }

    public void setEyes(Reference eyes) {
        this.eyes = eyes;
    }

    public CloseSettingsDto getSettings() {
        return settings;
    }

    public void setSettings(CloseSettingsDto settings) {
        this.settings = settings;
    }
}
