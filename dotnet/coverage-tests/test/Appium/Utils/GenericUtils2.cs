using OpenQA.Selenium;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Appium.iOS;

namespace Applitools.Appium.GenericUtils
{
    public static class Utilities
    {
		public static IWebElement FindElement(IWebDriver driver, string element)
		{
			IWebElement resElement = null;
			try
			{
				resElement = driver.FindElement(By.CssSelector(element));
			}
			catch(InvalidSelectorException)
			{
				resElement = FindElementDiffMethods(driver, element);
			}
			catch(NoSuchElementException)
			{
				try
				{
					resElement = driver.FindElement(By.ClassName(element));
				}
				catch(NoSuchElementException)
				{
					resElement = driver.FindElement(By.Id(element));
				}
			}
			return resElement;
		}
		
		private static IWebElement FindElementDiffMethods(IWebDriver driver, string element)
		{
			IWebElement resElement = null;
            try
            {
				if (driver is AndroidDriver)
					resElement = driver.FindElement(MobileBy.AndroidUIAutomator("new UiSelector().textContains(\"" + element + "\")"));
				else if (driver is IOSDriver)
					resElement = driver.FindElement(MobileBy.AccessibilityId(element));
				else throw new WebDriverException("WRONG DRIVER");
				
            }
            catch (NoSuchElementException)
            {
                try
                {
					resElement = driver.FindElement(By.ClassName(element));
                }
                catch (NoSuchElementException)
                {
					resElement = driver.FindElement(By.Id(element));
				}
			}
            return resElement;
		}
    }
}
