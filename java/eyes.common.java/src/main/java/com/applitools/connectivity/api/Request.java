package com.applitools.connectivity.api;

import com.applitools.eyes.Logger;
import com.applitools.eyes.logging.Stage;
import com.applitools.utils.GeneralUtils;

import java.util.UUID;

public abstract class Request {

    public static String CONTENT_LENGTH_HEADER = "Content-Length";
    public static String CONTENT_TYPE_HEADER = "Content-Type";

    private static final int REQUEST_TIMEOUT = 60 * 1000;
    private static final int SLEEP_DURATION = 5000;
    private int timePassed = 0;

    protected Logger logger;
    protected final String requestId;

    public Request(Logger logger) {
        this.logger = logger;
        this.requestId = UUID.randomUUID().toString();
    }

    /**
     * Add a new http header to the request
     *
     * @param name  The header name
     * @param value The header value
     * @return An {@link Request} object updated with the given header
     */
    public abstract Request header(String name, String value);

    /**
     * @param method      The http method for the request
     * @param data        The data to send with the request. If null, no data will be sent.
     * @param contentType The data content type.  If null, no data will be sent.
     * @return Response from the server
     */
    protected abstract Response methodInner(String method, Object data, String contentType);

    public Response method(String method, Object data, String contentType) {
        header("x-applitools-request-id", requestId);
        try {
            Response response = methodInner(method, data, contentType);
            response.setRequestId(requestId);
            return response;
        } catch (Throwable t) {
            if (timePassed >= REQUEST_TIMEOUT) {
                throw t;
            }

            try {
                Thread.sleep(SLEEP_DURATION);
            } catch (InterruptedException ignored) {}

            timePassed += SLEEP_DURATION;
            GeneralUtils.logExceptionStackTrace(logger, Stage.GENERAL, t);
            Response response = method(method, data, contentType);
            response.setRequestId(requestId);
            return response;
        }
    }
}
