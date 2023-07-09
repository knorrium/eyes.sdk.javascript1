namespace Applitools.Selenium
{
    public class TargetPathLocator
    {
        protected internal TargetPathLocator Parent { get; }
        protected internal  IPathNodeValue Value { get; }

        public TargetPathLocator()
        {
        }

        public TargetPathLocator(TargetPathLocator parent, IPathNodeValue value)
        {
            Parent = parent;
            Value = value;
        }
    }
}