package com.applitools.connectivity;

import com.applitools.connectivity.api.AsyncRequestCallback;
import com.applitools.connectivity.api.Response;
import com.applitools.eyes.EyesException;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;

import javax.ws.rs.HttpMethod;

/**
 * Callback used for sending long requests to the server
 */
class RequestPollingCallback implements AsyncRequestCallback {

    private final RestClient restClient;
    private String pollingUrl;
    private final AsyncRequestCallback pollingFinishedCallback;
    private int sleepDuration = 500;
    private int requestCount = 0;

    RequestPollingCallback(RestClient restClient, String pollingUrl, AsyncRequestCallback pollingFinishedCallback) {
        this.restClient = restClient;
        this.pollingUrl = pollingUrl;
        this.pollingFinishedCallback = pollingFinishedCallback;
    }

    @Override
    public void onComplete(Response response) {
        try {
            int status = response.getStatusCode();
            if (status == HttpStatus.SC_CREATED) {
                restClient.sendAsyncRequest(pollingFinishedCallback, response.getHeader(HttpHeaders.LOCATION, true), HttpMethod.DELETE);
                return;
            }

            if (status != HttpStatus.SC_OK) {
                pollingFinishedCallback.onFail(new EyesException(
                        String.format("Got bad status code when polling from the server. Status code: %d", status)));
                return;
            }
        } finally {
            response.close();
        }

        String location = response.getHeader(HttpHeaders.LOCATION, true);
        if (location != null) {
            pollingUrl = location;
        }

        int timeToWait = sleepDuration;
        String secondsToWait = response.getHeader("Retry-After", true);
        if (secondsToWait != null) {
            timeToWait = Integer.parseInt(secondsToWait) * 1000;
        } else if (requestCount++ >= 5) {
            sleepDuration *= 2;
            requestCount = 0;
            sleepDuration = Math.min(5000, sleepDuration);
        }

        try {
            Thread.sleep(timeToWait);
        } catch (InterruptedException ignored) {}
        restClient.sendAsyncRequest(this, pollingUrl, HttpMethod.GET);
    }

    @Override
    public void onFail(Throwable throwable) {
        pollingFinishedCallback.onFail(throwable);
    }
}
