#!/usr/bin/env pwsh

$IMG_VER = (Get-ChildItem ./PackagesOutput/Eyes.Images*.nupkg -Name)
$IMG_VER = [regex]::match($IMG_VER,'^Eyes\.Images\.(.*).nupkg$').Groups[1].Value

$path = $PWD.Path+"/Tests/Eyes.Images.E2ETests/Eyes.Images.E2ETests.csproj"
$xml = [xml](Get-Content $path)
$nodes = $xml.SelectNodes("/Project/ItemGroup/PackageReference[@Include='Eyes.Images']");
$nodes[0].SetAttribute("Version", $IMG_VER)
$xml.Save($path)

Write-Output "Updated Eyes.Images PackageReference to version $IMG_VER"

$SEL_VER = (Get-ChildItem ./PackagesOutput/Eyes.Selenium.*.nupkg -Name)
$SEL_VER = [regex]::match($SEL_VER,'^Eyes\.Selenium\.(.*).nupkg$').Groups[1].Value

$path = $PWD.Path+"/Tests/Eyes.Selenium.UnitTests/Eyes.Selenium.UnitTests.csproj"
$xml = [xml](Get-Content $path)
$nodes = $xml.SelectNodes("/Project/ItemGroup/PackageReference[@Include='Eyes.Selenium']");
$nodes[0].SetAttribute("Version", $SEL_VER)
$xml.Save($path)

Write-Output "Updated Eyes.Selenium PackageReference to version $SEL_VER"