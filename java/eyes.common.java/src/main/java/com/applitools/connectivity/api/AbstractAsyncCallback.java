package com.applitools.connectivity.api;

import com.applitools.eyes.Logger;
import com.applitools.eyes.TaskListener;
import com.applitools.eyes.logging.Stage;
import com.applitools.utils.GeneralUtils;

public abstract class AbstractAsyncCallback<T> implements AsyncRequestCallback {

    private final Logger logger;
    private final TaskListener<T> listener;

    public AbstractAsyncCallback(Logger logger, TaskListener<T> listener) {
        this.logger = logger;
        this.listener = listener;
    }

    protected abstract T onCompleteInner(Response response);

    @Override
    public void onComplete(Response response) {
        try {
            listener.onComplete(onCompleteInner(response));
        } catch (Throwable t) {
            onFail(t);
        } finally {
            response.close();
        }
    }

    @Override
    public void onFail(Throwable throwable) {
        GeneralUtils.logExceptionStackTrace(logger, Stage.GENERAL, throwable);
        listener.onFail();
    }
}
