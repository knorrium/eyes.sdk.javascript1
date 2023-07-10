#!/usr/bin/env pwsh

$version = ${env:CORE_VERSION}
echo "Updating Eyes.Image.Core to version $version"
$path = $PWD.Path+"/Eyes.Image.Core.DotNet/Eyes.Image.Core.DotNet.csproj"
$xml = [xml](Get-Content $path)
$propGroup = $xml.Project.PropertyGroup[0]
$propGroup.Version = $version
$propGroup.PackageReleaseNotes = "### Updated`n- Server Core to version $version"
$xml.Save($path)

