package com.applitools.eyes.unit;

import com.applitools.eyes.ProxySettings;
import com.applitools.eyes.TestResults;
import com.applitools.eyes.universal.dto.DeleteTestSettingsDto;
import com.applitools.eyes.universal.mapper.ProxyMapper;
import com.applitools.eyes.universal.mapper.SettingsMapper;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TestDeleteBatchMapping {

    @Test
    public void testDeleteBatchMapping() {
        ProxySettings proxy = new ProxySettings("uri");
        String serverUrl = "server-url";
        String apiKey = "api-key";;

        TestResults results = new TestResults();
        results.setId("testResults.id");
        results.setBatchId("testResults.batchId");
        results.setSecretToken("testResults.secretToken");


        DeleteTestSettingsDto settings = SettingsMapper.toDeleteTestSettingsDto(results, apiKey, serverUrl,
                ProxyMapper.toProxyDto(proxy));

        Assert.assertEquals(settings.getServerUrl(), serverUrl);
        Assert.assertEquals(settings.getApiKey(), apiKey);
        Assert.assertEquals(settings.getProxy().getUrl(), "uri");

        Assert.assertEquals(settings.getTestId(), results.getId());
        Assert.assertEquals(settings.getBatchId(), results.getBatchId());
        Assert.assertEquals(settings.getSecretToken(), results.getSecretToken());
    }
}
