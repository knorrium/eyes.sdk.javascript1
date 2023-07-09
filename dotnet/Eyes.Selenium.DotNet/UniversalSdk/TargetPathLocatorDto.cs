using Applitools.Fluent;

namespace Applitools.Selenium
{
    public class TargetPathLocatorDto : TRegion
    {
        public string Selector { get; set; }
        public string Type { get; set; }
        public string ElementId { get; set; }
        public TargetPathLocatorDto Shadow { get; set; }
        public TargetPathLocatorDto Fallback { get; set; }
        public TargetPathLocatorDto Child { get; set; }
    }
}