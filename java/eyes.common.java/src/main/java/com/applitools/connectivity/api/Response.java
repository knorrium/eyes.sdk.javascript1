package com.applitools.connectivity.api;

import com.applitools.eyes.Logger;
import com.applitools.eyes.logging.Stage;
import com.applitools.eyes.logging.Type;
import org.apache.commons.lang3.tuple.Pair;

import java.util.HashSet;
import java.util.Map;

public abstract class Response {

    private String requestId;

    protected Logger logger;

    protected byte[] body;

    public Response(Logger logger) {
        this.logger = logger;
    }

    public abstract int getStatusCode();

    public abstract String getStatusPhrase();

    /**
     * Get a response header
     *
     * @param name       The name of the header
     * @param ignoreCase If true, ignores case
     * @return The value of the header
     */
    public abstract String getHeader(String name, boolean ignoreCase);

    protected abstract Map<String,String> getHeaders();

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    protected abstract void readEntity();

    public byte[] getBody() {
        return body;
    }

    public String getBodyString() {
        return new String(body);
    }

    public abstract void close();

    public void logIfError() {
        try {
            if (getStatusCode() >= 300) {
                logger.log(new HashSet<String>(), Stage.GENERAL, Type.REQUEST_FAILED,
                        Pair.of("statusCode", getStatusCode()),
                        Pair.of("statusPhrase", getStatusPhrase()),
                        Pair.of("headers", getHeaders()),
                        Pair.of("body", getBodyString()),
                        Pair.of("requestId", requestId));
            }
        } catch (Exception e) {
            logger.log(new HashSet<String>(), Stage.GENERAL, Type.REQUEST_FAILED,
                    Pair.of("statusCode", getStatusCode()),
                    Pair.of("statusPhrase", getStatusPhrase()),
                    Pair.of("headers", getHeaders()),
                    Pair.of("requestId", requestId));
        }
    }
}
