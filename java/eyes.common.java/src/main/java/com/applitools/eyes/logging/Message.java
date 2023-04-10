package com.applitools.eyes.logging;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Message {
    private String agentId;
    private Stage stage;
    private Type type;
    private Set<String> testId;
    private long threadId;
    private String stackTrace;
    private Map<String, Object> data;

    public Message() {}

    public Message(String agentId, Stage stage, Type type, Set<String> testId, long threadId, String stackTrace, Map<String, Object> data) {
        this.agentId = agentId;
        this.stage = stage;
        this.type = type;
        this.testId = testId == null ? new HashSet<String>() : testId;
        this.threadId = threadId;
        this.stackTrace = stackTrace;
        this.data = data;
    }

    public String getAgentId() {
        return agentId;
    }

    public Stage getStage() {
        return stage;
    }

    public Type getType() {
        return type;
    }

    public Set<String> getTestId() {
        return testId;
    }

    public long getThreadId() {
        return threadId;
    }

    public String getStackTrace() {
        return stackTrace;
    }

    public Map<String, Object> getData() {
        return data;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Message message = (Message) o;
        return threadId == message.threadId && Objects.equals(agentId, message.agentId) && stage == message.stage && type == message.type && Objects.equals(testId, message.testId) && Objects.equals(stackTrace, message.stackTrace) && Objects.equals(data, message.data);
    }

    @Override
    public int hashCode() {
        return Objects.hash(agentId, stage, type, testId, threadId, stackTrace, data);
    }
}
