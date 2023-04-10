package com.applitools.eyes.logging;

import com.applitools.utils.ArgumentGuard;

import java.util.ArrayList;
import java.util.List;

public class LogSessionsClientEvents {
    private final List<ClientEvent> events;

    public LogSessionsClientEvents() {
        events = new ArrayList<>();
    }

    public int size() {
        return events.size();
    }

    public List<ClientEvent> getEvents() {
        return events;
    }

    public void addEvent(ClientEvent event) {
        ArgumentGuard.notNull(event, "event");
        events.add(event);
    }

    public void clear() {
        events.clear();
    }
}
