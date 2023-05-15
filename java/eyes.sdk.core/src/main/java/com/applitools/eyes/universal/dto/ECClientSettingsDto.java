package com.applitools.eyes.universal.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ECClientSettingsDto {

    private String serverUrl;
    private ECCapabilitiesOptions options;
    private Integer port;
    private ProxyDto proxy;

    public ECClientSettingsDto(String serverUrl, ECCapabilitiesOptions options, Integer port, ProxyDto proxy) {
        this.serverUrl = serverUrl;
        this.options = options;
        this.port = port;
        this.proxy = proxy;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    public ECCapabilitiesOptions getOptions() {
        return options;
    }

    public void setOptions(ECCapabilitiesOptions options) {
        this.options = options;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public ProxyDto getProxy() {
        return proxy;
    }

    public void setProxy(ProxyDto proxy) {
        this.proxy = proxy;
    }

    @Override
    public String toString() {
        return "ECClientSettingsDto{" +
                "serverUrl='" + serverUrl + '\'' +
                ", options=" + options +
                ", port=" + port +
                ", proxy=" + proxy +
                '}';
    }
}
