package com.applitools.eyes.visualgrid.model;

public class NMGOptions {
    private final String key;
    private final Object value;

    public NMGOptions(String key, Object value) {
        this.key = key;
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public Object getValue() {
        return value;
    }

    @Override
    public String toString() {
        return "NMGOptions{" +
                "key='" + key + "'" +
                ", value=" + value +
                "}";
    }
}
