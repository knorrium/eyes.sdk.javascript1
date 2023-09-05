using System;
using Applitools;
using Applitools.Metadata;
using Applitools.Tests.Utils;
using Applitools.Utils;
using NUnit.Framework;

namespace Eyes.Images.E2ETests
{
    [Parallelizable(ParallelScope.Children)]
    public abstract class ImagesGenericTestsBase
    {
        private readonly System.Threading.ThreadLocal<Applitools.Images.Eyes> eyes_ = new();
        private static string TEST_SUITE_NAME = "Eyes Image SDK";
        protected static BatchInfo Batch = new BatchInfo(TEST_SUITE_NAME);

        protected Applitools.Images.Eyes Eyes => eyes_.Value;

        [SetUp]
        public void Setup()
        {
            eyes_.Value = new Applitools.Images.Eyes
            {
                ApiKey = Environment.GetEnvironmentVariable("APPLITOOLS_API_KEY"), 
                BranchName = "master_java",
                //eyes.Logger = new Logger();
                //LogHandler logHandler = new StdoutLogHandler(verboseLogs);
                SaveNewTests = true,
                Batch = Batch
            };

            if (Environment.GetEnvironmentVariable("APPLITOOLS_USE_PROXY") != null)
            {
                eyes_.Value.Proxy = new ProxySettings("http://127.0.0.1", 8888);
            }
        }

        [TearDown]
        public void TearDown()
        {
            eyes_.Value?.AbortIfNotClosed();
        }

        protected string GetApplicationName()
        {
            return "Applitools Eyes SDK";
        }
        
        protected SessionResults GetTestInfo(TestResults results)
        {
            SessionResults sessionResults = null;
            try
            {
                sessionResults = TestUtils.GetSessionResults(Eyes.ApiKey, results);
            }
            catch (Exception e)
            {
                //CommonUtils.LogExceptionStackTrace(logger_, Stage.TestFramework, StageType.TestResults, e);
                Assert.Fail("Exception appeared while getting session results");
            }

            ArgumentGuard.NotNull(sessionResults, nameof(sessionResults));
            return sessionResults;
        }
    }
}