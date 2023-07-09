using OpenQA.Selenium;

namespace Applitools.Selenium
{
    public class ShadowDomLocator : TargetPathLocator
    {
        public ShadowDomLocator(TargetPathLocator parent, IPathNodeValue value)
            : base(parent, value)
        {
        }

        public RegionLocator Region(IWebElement element)
        {
            return new RegionLocator(this, new ElementReference(element));
        }

        public RegionLocator Region(By by)
        {
            return new RegionLocator(this, new ElementSelector(by));
        }

        public RegionLocator Region(string selector)
        {
            return new RegionLocator(this, new ElementSelector(selector)); // this
        }

        public ShadowDomLocator Shadow(IWebElement element)
        {
            return new ShadowDomLocator(this, new ElementReference(element));
        }

        public ShadowDomLocator Shadow(By by)
        {
            return new ShadowDomLocator(this, new ElementSelector(by));
        }

        public ShadowDomLocator Shadow(string selector)
        {
            return new ShadowDomLocator(this, new ElementSelector(selector)); //this
        }
    }
}