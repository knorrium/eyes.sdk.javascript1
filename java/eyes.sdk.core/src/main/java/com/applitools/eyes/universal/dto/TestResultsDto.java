package com.applitools.eyes.universal.dto;

import com.applitools.eyes.*;
import com.applitools.utils.ArgumentGuard;
import com.applitools.utils.Iso8610CalendarDeserializer;
import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.util.Calendar;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestResultsDto {
    private int steps;
    private int matches;
    private int mismatches;
    private int missing;
    private int exactMatches;
    private int strictMatches;
    private int contentMatches;
    private int layoutMatches;
    private int noneMatches;
    private String url;
    private Boolean isNew;
    private TestResultsStatus status;
    private String name;
    private String secretToken;
    private String id;
    private String appName;
    private String batchName;
    private String batchId;
    private String branchName;
    private String hostOS;
    private String hostApp;
    private RectangleSize hostDisplaySize;
    @JsonDeserialize(using = Iso8610CalendarDeserializer.class)
    private Calendar startedAt;
    private Integer duration;
    private boolean isDifferent;
    private boolean isAborted;
    private SessionUrls appUrls;
    private SessionUrls apiUrls;
    private StepInfo[] stepsInfo;
    private SessionAccessibilityStatus accessibilityStatus;
    private String userTestId;

    @JsonProperty("server")
    private ServerInfoDto serverInfo;
    @JsonIgnore
    private ProxyDto proxy;

    public TestResultsDto() {

    }

    public StepInfo[] getStepsInfo() {
        return stepsInfo;
    }

    public void setStepsInfo(StepInfo[] stepsInfo) {
        this.stepsInfo = stepsInfo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSecretToken() {
        return secretToken;
    }

    public void setSecretToken(String secretToken) {
        this.secretToken = secretToken;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public String getBatchName() {
        return batchName;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getHostOS() {
        return hostOS;
    }

    public void setHostOS(String hostOS) {
        this.hostOS = hostOS;
    }

    public String getHostApp() {
        return hostApp;
    }

    public void setHostApp(String hostApp) {
        this.hostApp = hostApp;
    }

    public RectangleSize getHostDisplaySize() {
        return hostDisplaySize;
    }

    public void setHostDisplaySize(RectangleSize hostDisplaySize) {
        this.hostDisplaySize = hostDisplaySize;
    }

    public Calendar getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Calendar startedAt) {
        this.startedAt = startedAt;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    @JsonGetter("isDifferent")
    public boolean isDifferent() {
        return isDifferent;
    }

    @JsonSetter("isDifferent")
    public void setDifferent(boolean different) {
        isDifferent = different;
    }

    @JsonGetter("isAborted")
    public boolean isAborted() {
        return isAborted;
    }

    @JsonSetter("isAborted")
    public void setAborted(boolean aborted) {
        isAborted = aborted;
    }

    public SessionUrls getAppUrls() {
        return appUrls;
    }

    public void setAppUrls(SessionUrls appUrls) {
        this.appUrls = appUrls;
    }

    public SessionUrls getApiUrls() {
        return apiUrls;
    }

    public void setApiUrls(SessionUrls apiUrls) {
        this.apiUrls = apiUrls;
    }

    public int getSteps() {
        return steps;
    }

    public int getMatches() {
        return matches;
    }

    public int getMismatches() {
        return mismatches;
    }

    public int getMissing() {
        return missing;
    }

    @SuppressWarnings("UnusedDeclaration")
    public int getExactMatches() {
        return exactMatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public int getStrictMatches() {
        return strictMatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public int getContentMatches() {
        return contentMatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public int getLayoutMatches() {
        return layoutMatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public int getNoneMatches() {
        return noneMatches;
    }

    public String getUrl() {
        return url;
    }

    @JsonGetter("isNew")
    public Boolean isNew() {
        return isNew;
    }

    public boolean isPassed() {
        return status == TestResultsStatus.Passed;
    }

    public TestResultsStatus getStatus() {
        return status;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setSteps(int steps) {
        ArgumentGuard.greaterThanOrEqualToZero(steps, "steps");
        this.steps = steps;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setMatches(int matches) {
        ArgumentGuard.greaterThanOrEqualToZero(matches, "matches");
        this.matches = matches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setMismatches(int mismatches) {
        ArgumentGuard.greaterThanOrEqualToZero(mismatches, "mismatches");
        this.mismatches = mismatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setMissing(int missing) {
        ArgumentGuard.greaterThanOrEqualToZero(missing, "missing");
        this.missing = missing;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setExactMatches(int exactMatches) {
        ArgumentGuard.greaterThanOrEqualToZero(exactMatches, "exactMatches");
        this.exactMatches = exactMatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setStrictMatches(int strictMatches) {
        ArgumentGuard.greaterThanOrEqualToZero(strictMatches, "strictMatches");
        this.strictMatches = strictMatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setContentMatches(int contentMatches) {
        ArgumentGuard.greaterThanOrEqualToZero(contentMatches, "contentMatches");
        this.contentMatches = contentMatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setLayoutMatches(int layoutMatches) {
        ArgumentGuard.greaterThanOrEqualToZero(layoutMatches, "layoutMatches");
        this.layoutMatches = layoutMatches;
    }

    @SuppressWarnings("UnusedDeclaration")
    public void setNoneMatches(int noneMatches) {
        ArgumentGuard.greaterThanOrEqualToZero(noneMatches, "noneMatches");
        this.noneMatches = noneMatches;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @JsonSetter("isNew")
    public void setNew(Boolean isNew) {
        this.isNew = isNew;
    }

    public void setStatus(TestResultsStatus status) {
        this.status = status;
    }

    public void setAccessibilityStatus(SessionAccessibilityStatus accessibilityStatus) {
        this.accessibilityStatus = accessibilityStatus;
    }

    public SessionAccessibilityStatus getAccessibilityStatus() {
        return accessibilityStatus;
    }

    public String getUserTestId() {
        return userTestId;
    }

    public void setUserTestId(String userTestId) {
        this.userTestId = userTestId;
    }

    public void setApiKey(ServerInfoDto serverInfo) {
        this.serverInfo = serverInfo;
    }

    public ServerInfoDto getServer() {
        return serverInfo;
    }

    @JsonIgnore
    public void setProxy(ProxyDto proxy) {
        this.proxy = proxy;
    }

    public ProxyDto getProxy() {
        return proxy;
    }

}