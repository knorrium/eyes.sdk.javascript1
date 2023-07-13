using Applitools.Tests.Utils;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using Applitools.Metadata;
using Applitools.Images;
using Applitools.Utils;
using NUnit.Framework;

namespace Applitools.Generated.Images.Tests
{
    public abstract class TestSetupGenerated : FilteringTestSuite
    {
        protected Eyes eyes;
        protected ClassicRunner runner;

        public static readonly BatchInfo BatchInfo = new BatchInfo("DotNet Generated Tests - Images");

        protected void InitEyes()
        {
            string testName = NUnit.Framework.TestContext.CurrentContext.Test.MethodName;
            ILogHandler logHandler = TestUtils.InitLogHandler(testName);
            eyes = new Eyes
            {
                MatchTimeout = TimeSpan.Zero,
                ParentBranchName = "master",
                Batch = BatchInfo,
                SaveNewTests = false,
                HideScrollbars = true,
                HideCaret = true,
            };
        }

        protected bool IsStaleElementError(Exception errorObj)
        {
            return false; //(errorObj is StaleElementReferenceException);
        }

        protected string GetDomString(TestResults results, string domId)
        {
            return TestUtils.GetDom(Environment.GetEnvironmentVariable("APPLITOOLS_API_KEY_READ"), results, domId);
        }

        protected JObject GetDom(TestResults results, string domId)
        {
            string dom = GetDomString(results, domId);
            return JObject.Parse(dom);
        }

        protected IList<JToken> GetNodesByAttribute(JObject dom, string attributeName)
        {
            return dom.SelectTokens($"$..[?(@.attributes['{attributeName}'])]").ToList();
        }

        protected SessionResults GetTestInfo(TestResults results)
        {
            SessionResults sessionResults = null;
            try
            {
                sessionResults = TestUtils.GetSessionResults(eyes.ApiKey, results);
            }
            catch (Exception e)
            {
                CommonUtils.LogExceptionStackTrace(logger_, Stage.TestFramework, StageType.TestResults, e);
                Assert.Fail("Exception appeared while getting session results");
            }

            ArgumentGuard.NotNull(sessionResults, nameof(sessionResults));
            return sessionResults;
        }

        protected void SetBatch(string name, Dictionary<string, string>[] properties)
        {
            BatchInfo batch = new BatchInfo(name);
            foreach (var item in properties)
            {
                batch.AddProperty(item["name"], item["value"]);
            }

            eyes.Batch = batch;
        }

        protected void SetLayoutBreakpoints(LayoutBreakpointsOptions breakpointsOptions)
        {
            var config = eyes.GetConfiguration();
            config.SetLayoutBreakpoints(breakpointsOptions);
            eyes.SetConfiguration(config);   
        }
        
        protected void SetLayoutBreakpoints(params int[] breakpoints)
        {
            var config = eyes.GetConfiguration();
            config.SetLayoutBreakpoints(breakpoints);
            eyes.SetConfiguration(config);
        }
        
        protected void SetLayoutBreakpoints(bool enabled)
        {
            var config = eyes.GetConfiguration();
            config.SetLayoutBreakpoints(enabled);
            eyes.SetConfiguration(config);
        }

        protected void SetEnablePatterns(bool enable)
        {
            var config = eyes.GetConfiguration();
            config.SetEnablePatterns(enable);
            eyes.SetConfiguration(config);
        }

        protected void SetAccessibilitySettings(AccessibilitySettings accessibilitySettings)
        {
            var config = eyes.GetConfiguration();
            config.SetAccessibilityValidation(accessibilitySettings);
            eyes.SetConfiguration(config);
        }
        
        protected void WaitBeforeCapture(int waitTimeMs)
        {
            var config = eyes.GetConfiguration();
            config.SetWaitBeforeCapture(waitTimeMs);
            eyes.SetConfiguration(config);
        }
        
        protected List<JObject> GetNodesByAttributes(JObject dom, string attribute)
        {
            var nodes = new List<JObject>();
            if (dom.TryGetValue("attributes", out JToken attrs) && 
                attrs.Type == JTokenType.Object && 
                ((JObject)attrs).ContainsKey(attribute)) {
                nodes.Add(dom);
            }
            
            if (!dom.TryGetValue("childNodes", out JToken children)) {
                return nodes;
            }

            foreach (var child in children)
            {
                if (child.Type == JTokenType.Object)
                {
                    nodes.AddRange(GetNodesByAttributes((JObject)child, attribute));
                }
            }

            return nodes;
        }
    }
}