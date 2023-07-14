#!/usr/bin/env pwsh

$version = ${env:CORE_NUGET_VERSION}
Write-Output "Updating Eyes.Image.Core to version $version"
$path = $PWD.Path+"/Eyes.Image.Core.DotNet/Eyes.Image.Core.DotNet.csproj"
$xml = [xml](Get-Content $path)
$propGroup = $xml.Project.PropertyGroup[0]
$propGroup.Version = $version
$propGroup.PackageReleaseNotes = "### Updated`n- Server Core to version ${env:CORE_VERSION}"
$xml.Save($path)

Write-Output "Updating changelog"
$path = $PWD.Path+"/CHANGELOG.md"
@("## [Eyes.Image.Core ${version}] - UPDATED
### Updated
- Server Core to ${env:CORE_VERSION}") + (Get-Content $path) | Set-Content $path
