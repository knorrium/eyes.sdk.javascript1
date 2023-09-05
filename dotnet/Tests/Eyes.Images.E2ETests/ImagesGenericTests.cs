using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using Applitools;
using Applitools.Commands;
using Applitools.Images;
using Applitools.Metadata;
using Applitools.Tests.Utils;
using Applitools.Utils;
using Applitools.Utils.Geometry;
using Applitools.VisualGrid;
using AutoMapper.Mappers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Region = Applitools.Utils.Geometry.Region;

namespace Eyes.Images.E2ETests
{
    [Parallelizable(ParallelScope.Children)]
    public class ImagesGenericTests : ImagesGenericTestsBase
    {
        private static string EXTRACT_TEXT_IMAGE_PNG = "resources/extractText.png";
        private static string IMAGE_PATH_JPEG = "resources/minions_jpeg.jpeg";
        private Bitmap TEST_IMAGE = new Bitmap(IMAGE_PATH_JPEG);
        private Bitmap EXTRACT_TEXT_IMAGE = new Bitmap(EXTRACT_TEXT_IMAGE_PNG);

        [Test]
        public void IgnoreRegionsFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestIgnoreRegionFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).Ignore(new Rectangle(10, 20, 30, 40)));
            Eyes.Close();
        }

        [Test]
        public void FloatingRegionsFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestFloatingRegionFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).Floating(new Rectangle(10, 20, 30, 40), 5, 10, 20, 15));

            var result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);

            var floatingRegions = info.ActualAppOutput[0].ImageMatchSettings.Floating;

            TestUtils.compareProcedure(floatingRegions[0], new FloatingMatchSettings(10, 20, 30, 40, 5, 10, 20, 15));
        }

        [Test]
        public void MatchLevelExactFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestMatchLevelExactFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).MatchLevel(MatchLevel.Exact));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.Exact, matchLevel);
        }

        [Test]
        public void MatchLevelContentFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestMatchLevelIgnoreColorsFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).MatchLevel(MatchLevel.Content));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.Content, matchLevel);
        }

        [Test]
        public void MatchLevelIgnoreColorsFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestMatchLevelIgnoreColorsFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).MatchLevel(MatchLevel.IgnoreColors));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.IgnoreColors, matchLevel);
        }

        [Test]
        public void MatchLevelStrictFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestMatchLevelStrictFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).MatchLevel(MatchLevel.Strict));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.Strict, matchLevel);
        }

        [Test]
        public void MatchLevelLayoutFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestMatchLevelLayoutFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).MatchLevel(MatchLevel.Layout));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.Layout2, matchLevel);
        }

        [Test]
        public void MatchLevelExactNonFluentTest()
        {
            Eyes.SetConfiguration(Eyes.GetConfiguration().SetMatchLevel(MatchLevel.Exact));

            Eyes.Open(GetApplicationName(), "TestMatchLevelExactNonFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.Exact, matchLevel);
        }

        [Test]
        public void MatchLevelContentNonFluentTest()
        {
            Eyes.SetConfiguration(Eyes.GetConfiguration().SetMatchLevel(MatchLevel.Content));

            Eyes.Open(GetApplicationName(), "TestMatchLevelContentNonFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.Content, matchLevel);
        }

        [Test]
        public void MatchLevelIgnoreColorsNonFluentTest()
        {
            Eyes.SetConfiguration(Eyes.GetConfiguration().SetMatchLevel(MatchLevel.IgnoreColors));

            Eyes.Open(GetApplicationName(), "TestMatchLevelIgnoreColorsNonFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.IgnoreColors, matchLevel);
        }

        [Test]
        public void MatchLevelStrictNonFluentTest()
        {
            Eyes.SetConfiguration(Eyes.GetConfiguration().SetMatchLevel(MatchLevel.Strict));

            Eyes.Open(GetApplicationName(), "TestMatchLevelStrictNonFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.Strict, matchLevel);
        }

        [Test]
        public void MatchLevelLayoutNonFluentTest()
        {
            Eyes.SetConfiguration(Eyes.GetConfiguration().SetMatchLevel(MatchLevel.Layout));

            Eyes.Open(GetApplicationName(), "TestMatchLevelLayoutNonFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);
            MatchLevel matchLevel = info.ActualAppOutput[0].ImageMatchSettings.MatchLevel;

            Assert.AreEqual(MatchLevel.Layout2, matchLevel);
        }
        
        [Test]
        public void IgnoreDisplacementsFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestIgnoreDisplacementsFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).IgnoreDisplacements());

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);

            Assert.IsTrue(info.ActualAppOutput[0].ImageMatchSettings.IgnoreDisplacements);
        }

        [Test]
        public void IgnoreDisplacementsNonFluentTest()
        {
            Eyes.SetConfiguration(Eyes.GetConfiguration().SetIgnoreDisplacements(true));
            Eyes.Open(GetApplicationName(), "TestIgnoreDisplacementsNonFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);

            Assert.IsTrue(info.ActualAppOutput[0].ImageMatchSettings.IgnoreDisplacements);
        }

        [Test]
        public void CodedRegionsFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestCodedRegionsFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE)
                .Ignore(new Rectangle(10, 20, 30, 40))
                .Content(new Rectangle(10, 20, 30, 40))
                .Strict(new Rectangle(10, 20, 30, 40))
                .Layout(new Rectangle(10, 20, 30, 40))
            );

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);

            Region ignoreRegion = info.ActualAppOutput[0].ImageMatchSettings.Ignore[0];
            Region layoutRegion = info.ActualAppOutput[0].ImageMatchSettings.Layout[0];
            Region contentRegion = info.ActualAppOutput[0].ImageMatchSettings.Content[0];
            Region strictRegion = info.ActualAppOutput[0].ImageMatchSettings.Strict[0];

            TestUtils.compareProcedure(ignoreRegion, new Region(10, 20, 30, 40), "ignore");
            TestUtils.compareProcedure(layoutRegion, new Region(10, 20, 30, 40), "layout");
            TestUtils.compareProcedure(contentRegion, new Region(10, 20, 30, 40), "content");
            TestUtils.compareProcedure(strictRegion, new Region(10, 20, 30, 40), "strict");
        }

        [Test]
        public void EnablePatternsFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestEnablePatternsFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE).EnablePatterns());

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);

            Assert.IsTrue(info.ActualAppOutput[0].ImageMatchSettings.EnablePatterns);
        }

        [Test]
        public void EnablePatternsNonFluentTest()
        {
            var config = Eyes.GetConfiguration();
            config.EnablePatterns = true;
            Eyes.SetConfiguration(config);
            Eyes.Open(GetApplicationName(), "TestEnablePatternsNonFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE));

            TestResults result = Eyes.Close(false);
            var info = TestUtils.GetSessionResults(Eyes.ApiKey, result);

            Assert.IsTrue(info.ActualAppOutput[0].ImageMatchSettings.EnablePatterns);
        }

        [Test]
        public void CheckRegionNonFluentTest()
        {
            Eyes.Open(GetApplicationName(), "TestCheckRegionNonFluent",
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.CheckRegion(TEST_IMAGE, new Rectangle(50, 50, 50, 50));
            Eyes.Close();
        }

        [Test]
        public void ExtractTextTest()
        {
            var image = EXTRACT_TEXT_IMAGE;
            Eyes.Open("Applitools Eyes SDK", "ExtractText", new RectangleSize(image.Width, image.Height));
            var result = Eyes.ExtractText(new OcrRegion(image));
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("This is the navigation bar", result.ElementAt(0));
            Eyes.Close();
        }

        [Test]
        public void ExtractTextRegionsTest()
        {
            var image = EXTRACT_TEXT_IMAGE_PNG;
            Eyes.Open("Applitools Eyes SDK", "ExtractTextRegions");
            var result = Eyes.ExtractTextRegions(new TextRegionSettings(".+").SetImage(image));
            Assert.AreEqual(1, result.Count);
            var regions = result.First().Value;
            Assert.AreEqual(1, regions.Count);
            var region = regions.First();
            Assert.AreEqual(new TextRegion(10, 11, 18, 214, "Thisisthenavigationbar"), region);
            Eyes.Close();
        }

        [Test]
        public void LocateTest()
        {
            var image = EXTRACT_TEXT_IMAGE;
            Eyes.Open("Eyes Images SDK", "Locate", new RectangleSize(image.Width, image.Height));
            Eyes.Check(Target.Image(image));

            var result = Eyes.Locate(new VisualLocatorSettings().Name("the").Image(image));
            var regions = result["the"];
            Assert.AreEqual(1, regions.Count);
            var region = regions.First();

            Assert.AreEqual(new Region(69, 9, 31, 20), region);
            Eyes.Close();
        }

        [Test]
        public async Task EnsureDeviceNames()
        {
            using HttpClient client = new HttpClient();
            string devicesJson =
                await client.GetStringAsync("https://render-wus.applitools.com/emulated-devices-sizes");
            var deviceNamesFromServer = JsonConvert.DeserializeObject<Dictionary<string, object>>(devicesJson)
                .Select(kvp => kvp.Key);
            var deviceNamesFromEnum = new List<string>();
            foreach (var dev in Enum.GetValues(typeof(DeviceName)))
            {
                string devName = dev.GetAttribute<EnumMemberAttribute>().Value;
                deviceNamesFromEnum.Add(devName);
            }

            CollectionAssert.AreEquivalent(deviceNamesFromServer, deviceNamesFromEnum);
        }

        [Test]
        public void CustomPropertiesTest()
        {
            Eyes.AddProperty("custom property test 1", "custom value 1");
            Eyes.Batch.AddProperty("custom batch property 2", "custom batch value 2");
            Eyes.Open(GetApplicationName(), nameof(CustomPropertiesTest),
                new RectangleSize(TEST_IMAGE.Width, TEST_IMAGE.Height));
            Eyes.Check(Target.Image(TEST_IMAGE));
            TestResults result = Eyes.Close();
            SessionResults info = GetTestInfo(result);
            Assert.AreEqual(1, info.StartInfo.Properties.Count());
            CollectionAssert.AreEquivalent(new Dictionary<string, string>
                    { { "name", "custom property test 1" }, { "value", "custom value 1" } },
                ((JObject)info.StartInfo.Properties[0]).ToObject<Dictionary<string, object>>());
            Assert.AreEqual(1, info.StartInfo.BatchInfo.Properties.Count());
            CollectionAssert.AreEquivalent(new Dictionary<string, string>
                    { { "name", "custom batch property 2" }, { "value", "custom batch value 2" } },
                info.StartInfo.BatchInfo.Properties[0].ToDictionary());
        }
    }
}