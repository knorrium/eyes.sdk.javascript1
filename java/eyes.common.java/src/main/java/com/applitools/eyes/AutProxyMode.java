package com.applitools.eyes;

public enum AutProxyMode {

    ALLOW("Allow"),

    BLOCK("Block");

    private final String name;

    AutProxyMode(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

}

