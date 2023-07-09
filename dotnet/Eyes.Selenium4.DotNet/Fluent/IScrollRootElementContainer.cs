using Applitools.Selenium;
using OpenQA.Selenium;

namespace Applitools
{
    internal interface IScrollRootElementContainer
    {
        IWebElement GetScrollRootElement();
        By GetScrollRootSelector();
    }

    internal interface ITargetContainer
    {
        By GetTargetSelector();

        IWebElement GetTargetElement();

        TargetPathLocator GetTargetLocator();
    }
}
