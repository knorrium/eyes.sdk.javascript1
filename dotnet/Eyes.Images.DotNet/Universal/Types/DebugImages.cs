namespace Applitools
{
    public class DebugImages
    {
        public bool Save { get; }
        public string Path { get; }
        public string Prefix { get; }

        public DebugImages(string path, string prefix)
        {
            Save = true;
            Path = path;
            Prefix = prefix;
        }
    }
}