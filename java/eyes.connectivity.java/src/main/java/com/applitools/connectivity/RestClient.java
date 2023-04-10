package com.applitools.connectivity;

import com.applitools.connectivity.api.*;
import com.applitools.eyes.AbstractProxySettings;
import com.applitools.eyes.EyesException;
import com.applitools.eyes.Logger;
import com.applitools.eyes.SyncTaskListener;
import com.applitools.eyes.logging.Stage;
import com.applitools.utils.ArgumentGuard;
import com.applitools.utils.GeneralUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.brotli.dec.BrotliInputStream;

import javax.ws.rs.HttpMethod;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.util.*;

public class RestClient {

    /**
     * An interface used as base for anonymous classes wrapping Http Method
     * calls.
     */
    protected interface HttpMethodCall {
        Response call();
    }

    protected interface HttpRequestBuilder {
        AsyncRequest build();
    }

    private static final String AGENT_ID_CUSTOM_HEADER = "x-applitools-eyes-client";

    protected Logger logger;
    protected HttpClient restClient;
    protected URI serverUrl;
    protected String agentId;

    // Used for JSON serialization/de-serialization.
    protected ObjectMapper jsonMapper;

    /***
     * @param logger    Logger instance.
     * @param serverUrl The URI of the rest server.
     */
    public RestClient(Logger logger, URI serverUrl, int timeout) {
        ArgumentGuard.notNull(serverUrl, "serverUrl");

        this.logger = logger;
        jsonMapper = new ObjectMapper();
        jsonMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.serverUrl = serverUrl;
        this.restClient = new HttpClientImpl(logger, timeout, null);
    }

    public void setLogger(Logger logger) {
        ArgumentGuard.notNull(logger, "logger");
        if (restClient != null) {
            restClient.setLogger(logger);
        }

       this.logger = logger;
    }

    public Logger getLogger() {
        return this.logger;
    }

    public void setProxy(AbstractProxySettings proxySettings) {
        int timeout = restClient.getTimeout();
        restClient.close();
        restClient = new HttpClientImpl(logger, timeout, proxySettings);
    }

    public AbstractProxySettings getProxy() {
        return restClient.getProxySettings();
    }

    public void setTimeout(int timeout) {
        ArgumentGuard.greaterThanOrEqualToZero(timeout, "timeout");
        AbstractProxySettings proxySettings = restClient.getProxySettings();
        restClient.close();
        restClient = new HttpClientImpl(logger, timeout, proxySettings);
    }

    public int getTimeout() {
        return restClient.getTimeout();
    }

    protected void setServerUrlBase(URI serverUrl) {
        ArgumentGuard.notNull(serverUrl, "serverUrl");
        this.serverUrl = serverUrl;
    }

    protected URI getServerUrlBase() {
        return serverUrl;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public String getAgentId() {
        return this.agentId;
    }

    protected void initClient() {
        if (restClient.isClosed()) {
            restClient = new HttpClientImpl(logger, getTimeout(), getProxy());
        }
    }

    public void sendAsyncRequest(AsyncRequestCallback callback, final String url, final String method, final String... accept) {
        sendAsyncRequest(callback, url, method, new HashMap<String, String>(), accept);
    }

    public void sendAsyncRequest(AsyncRequestCallback callback, final String url, final String method, final Map<String, String> queryParams, final String... accept) {
        final AsyncRequest request = makeEyesRequest(new HttpRequestBuilder() {
            @Override
            public AsyncRequest build() {
                ConnectivityTarget target =  restClient.target(url);
                for (Map.Entry<String, String> pair : queryParams.entrySet()) {
                    target.queryParam(pair.getKey(), pair.getValue());
                }
                return target.asyncRequest(accept);
            }
        });

        sendAsyncRequest(request, method, callback);
    }

    public void sendAsyncRequest(AsyncRequest request, String method, AsyncRequestCallback callback) {
        sendAsyncRequest(request, method, callback, null, null);
    }

    public void sendAsyncRequest(AsyncRequest request, String method, AsyncRequestCallback callback, Object data, String contentType) {
        String currentTime = GeneralUtils.toRfc1123(Calendar.getInstance(TimeZone.getTimeZone("UTC")));
        request.header("Eyes-Date", currentTime).method(method, callback, data, contentType);
    }

    protected AsyncRequest makeEyesRequest(HttpRequestBuilder builder) {
        AsyncRequest request = builder.build();
        if (agentId == null) {
            return request;
        }

        return request.header(AGENT_ID_CUSTOM_HEADER, agentId);
    }

    /**
     * Send a synchronous request to the server
     */
    public Response sendHttpRequest(final String url, final String method, final String... accept) {
        return sendHttpRequest(url, method, Collections.<String, String>emptyMap(), accept);
    }

    public Response sendHttpRequest(final String url, final String method, Map<String, String> queryParams, final String... accept) {
        final SyncTaskListener<Response> listener = new SyncTaskListener<>(logger, String.format("sendHttpRequest to %s", url));
        sendAsyncRequest(new AsyncRequestCallback() {
            @Override
            public void onComplete(Response response) {
                listener.onComplete(response);
            }

            @Override
            public void onFail(Throwable throwable) {
                listener.onFail();
            }
        }, url, method, queryParams, accept);

        Response response = listener.get();
        if (response == null) {
            throw new EyesException("Failed getting response from the server");
        }

        return response;
    }

    public Response sendHttpRequest(String url, String method, Object data, String contentType, String... accept) {
        return restClient.target(url).request(accept).method(method, data, contentType);
    }

    protected void sendLongRequest(AsyncRequest request, String method, final AsyncRequestCallback callback, String data, String mediaType) throws EyesException {
        String currentTime = GeneralUtils.toRfc1123(Calendar.getInstance(TimeZone.getTimeZone("UTC")));
        request = request
                .header("Eyes-Expect", "202+location")
                .header("Eyes-Expect-Version", "2")
                .header("Eyes-Date", currentTime);

        AsyncRequestCallback requestFinishedCallback = new AsyncRequestCallback() {
            @Override
            public void onComplete(Response response) {
                String statusUrl = response.getHeader(HttpHeaders.LOCATION, true);
                int status = response.getStatusCode();
                if (statusUrl == null || status != HttpStatus.SC_ACCEPTED) {
                    callback.onComplete(response);
                    return;
                }

                response.close();
                RequestPollingCallback pollingCallback = new RequestPollingCallback(RestClient.this, statusUrl, callback);
                sendAsyncRequest(pollingCallback, statusUrl, HttpMethod.GET);
            }

            @Override
            public void onFail(Throwable throwable) {
                callback.onFail(throwable);
            }
        };

        sendAsyncRequest(request, method, requestFinishedCallback, data, mediaType);
    }

    /**
     * Builds an error message which includes the response model.
     *
     * @param errMsg       The error message.
     * @param statusCode   The response status code.
     * @param statusPhrase The response status phrase.
     * @param responseBody The response body.
     * @return An error message which includes the response model.
     */
    protected String getReadResponseError(String errMsg, int statusCode, String statusPhrase, String responseBody) {
        ArgumentGuard.notNull(statusPhrase, "statusPhrase");
        if (errMsg == null) {
            errMsg = "";
        }

        if (responseBody == null) {
            responseBody = "";
        }

        return errMsg + " [" + statusCode + " " + statusPhrase + "] " + responseBody;
    }

    /**
     * Generic handling of response with model. Response Handling includes the
     * following:
     * 1. Verify that we are able to read response model.
     * 2. verify that the status code is valid
     * 3. Parse the response model from JSON to the relevant type.
     *
     * @param response             The response to parse.
     * @param validHttpStatusCodes The list of acceptable status codes.
     * @param resultType           The class object of the type of result this response
     *                             should be parsed to.
     * @param <T>                  The return value type.
     * @return The parse response of the type given in {@code resultType}.
     * @throws EyesException For invalid status codes or if the response
     *                       parsing failed.
     */
    protected <T> T parseResponseWithJsonData(Response response, List<Integer> validHttpStatusCodes, TypeReference<T> resultType)
            throws EyesException {
        ArgumentGuard.notNull(response, "response");
        ArgumentGuard.notNull(validHttpStatusCodes, "validHttpStatusCodes");
        ArgumentGuard.notNull(resultType, "resultType");

        T resultObject;
        int statusCode = response.getStatusCode();
        String statusPhrase = response.getStatusPhrase();
        String data = response.getBodyString();
        response.close();

        // Validate the status code.
        if (!validHttpStatusCodes.contains(statusCode)) {
            String errorMessage = getReadResponseError("Invalid status code", statusCode, statusPhrase, data);
            if (statusCode == 401 || statusCode == 403) {
                errorMessage += "\nThis is most likely due to an invalid API key.";
            }
            throw new EyesException(errorMessage);
        }

        // Parse model.
        try {
            resultObject = jsonMapper.readValue(data, resultType);
        } catch (IOException e) {
            String errorMessage = getReadResponseError("Failed deserialize response body",
                    statusCode, statusPhrase, data);
            throw new EyesException(errorMessage, e);
        }

        return resultObject;
    }

    protected byte[] downloadFile(Response response) {
        byte[] responseBody = response.getBody();
        String contentEncoding = response.getHeader("Content-Encoding", false);
        if (!"br".equalsIgnoreCase(contentEncoding)) {
            return responseBody;
        }

        try {
            return IOUtils.toByteArray(new BrotliInputStream(new ByteArrayInputStream(responseBody)));
        } catch (IOException e) {
            GeneralUtils.logExceptionStackTrace(logger, Stage.GENERAL, e);
        }
        return new byte[0];
    }
}
