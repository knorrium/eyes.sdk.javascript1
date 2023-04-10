package com.applitools.connectivity.api;

import com.applitools.eyes.Logger;

public abstract class ConnectivityTarget {

    protected Logger logger;

    public ConnectivityTarget(Logger logger) {
        this.logger = logger;
    }

    /**
     * @param path Appends path to the URI
     * @return A {@link ConnectivityTarget} updated with the given path
     */
    public abstract ConnectivityTarget path(String path);

    /**
     * Configures a query parameter on the URI
     *
     * @param name  Parameter name
     * @param value Parameter value
     * @return A {@link ConnectivityTarget} updated with the given query parameter
     */
    public abstract ConnectivityTarget queryParam(String name, String value);

    /**
     * Creates a request for sending to the server
     *
     * @param acceptableResponseTypes Accepted response media types
     * @return The request
     */
    public abstract Request request(String... acceptableResponseTypes);

    /**
     * Creates an async request for sending to the server
     *
     * @param acceptableResponseTypes Accepted response media types
     * @return The request
     */
    public abstract AsyncRequest asyncRequest(String... acceptableResponseTypes);
}
