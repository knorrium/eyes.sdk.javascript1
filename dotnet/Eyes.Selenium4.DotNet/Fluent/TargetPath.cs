using OpenQA.Selenium;

namespace Applitools.Selenium
{
    public static class TargetPath
    {
        public static RegionLocator Region(By by)
        {
            return new RegionLocator(null, new ElementSelector(by));
        }

        public static RegionLocator Region(IWebElement element)
        {
            return new RegionLocator(null, new ElementReference(element));
        }

        public static RegionLocator Region(string selector)
        {
            return new RegionLocator(null, new ElementSelector(selector));
        }

        public static ShadowDomLocator Shadow(By by)
        {
            return new ShadowDomLocator(null, new ElementSelector(by));
        }

        public static ShadowDomLocator Shadow(IWebElement element)
        {
            return new ShadowDomLocator(null, new ElementReference(element));
        }

        public static ShadowDomLocator Shadow(string selector)
        {
            return new ShadowDomLocator(null, new ElementSelector(selector));
        }
    }
}