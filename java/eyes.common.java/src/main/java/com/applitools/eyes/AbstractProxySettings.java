/*
 * Applitools software.
 */
package com.applitools.eyes;

import com.applitools.utils.ArgumentGuard;
import com.applitools.utils.GeneralUtils;

import java.util.Objects;

/***
 * Encapsulates settings for sending Eyes communication via proxy.
 */
public abstract class AbstractProxySettings {

    public static final String PROXY_ENV_VAR_NAME = "APPLITOOLS_HTTP_PROXY";

    protected String uri;
    protected String username;
    protected String password;
    protected Integer port;

    /**
     * @param uri      The proxy's URI.
     * @param port     The proxy's port
     * @param username The username to be sent to the proxy.
     * @param password The password to be sent to the proxy.
     */
    public AbstractProxySettings(String uri, Integer port, String username, String password) {
        ArgumentGuard.notNull(uri, "uri");
        this.uri = uri;
        this.port = port;
        this.username = username;
        this.password = password;
    }

    /**
     * @param uri  The proxy's URI.
     * @param port The proxy's port
     */
    public AbstractProxySettings(String uri, Integer port) {
        this(uri, port, null, null);
    }

    /**
     * @param uri      The proxy's URI.
     * @param username The username to be sent to the proxy.
     * @param password The password to be sent to the proxy.
     */
    public AbstractProxySettings(String uri, String username, String password) {
        this(uri, null, username, password);
    }

    /**
     * Defines proxy settings with empty username/password.
     *
     * @param uri The proxy's URI.
     */
    @SuppressWarnings("UnusedDeclaration")
    public AbstractProxySettings(String uri) {
        this(uri, null, null, null);
    }

    /**
     * Defines proxy settings with the url in the environment variable
     */
    public AbstractProxySettings() {
        this(GeneralUtils.getEnvString(PROXY_ENV_VAR_NAME));
    }

    public String getUri() {
        return uri;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public int getPort() {
        return port;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AbstractProxySettings that = (AbstractProxySettings) o;
        return Objects.equals(port, that.port) && Objects.equals(uri, that.uri) && Objects.equals(username, that.username) && Objects.equals(password, that.password);
    }

    @Override
    public int hashCode() {
        return Objects.hash(uri, username, password, port);
    }

    @Override
    public String toString() {
        String[] url = uri.split("://", 2);
        String protocol = url[0] + "://";
        String host = url[1];

        if (username != null && password != null) {
            return protocol + username + ':' + password + '@' + host;
        }

        return protocol + host;
    }
}
