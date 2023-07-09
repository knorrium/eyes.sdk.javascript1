using OpenQA.Selenium;

namespace Applitools.Selenium
{
    public class ElementReference : IPathNodeValue
    {
        public IWebElement Element { get; }

        public ElementReference(IWebElement element)
        {
            Element = element;
        }
    }
}