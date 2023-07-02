#!/usr/bin/env pwsh

cd dotnet
./download_cores.ps1
dotnet test Tests/Eyes.Selenium.UnitTests/Eyes.Selenium.UnitTests.csproj