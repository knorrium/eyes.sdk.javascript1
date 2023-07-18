#!/usr/bin/env pwsh
Param
(
    [String] [Parameter(Mandatory=$true)] $Url,
    [String] [Parameter(Mandatory=$true)] $ClassName
)

$json = (Invoke-WebRequest -Uri $Url).Content | ConvertFrom-Json
$code = "/*** GENERATED FILE ***/
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Runtime.Serialization;
// ReSharper disable All

namespace Applitools.VisualGrid
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum $ClassName
    {
"

    foreach ($elem in $json.PsObject.Properties.Name)
    {
        $memberName = $elem.Replace(' ', '_').Replace('/', '_')
        $memberName = $memberName.Replace('(1st_generation)', '')
        $memberName = $memberName -replace '\((\d).._generation\)', '$1'
        $memberName = $memberName -replace '\(.*\)', ''
        $memberName = $memberName.Replace('__', '_')
        $code += "        [EnumMember(Value = `"$elem`")] $memberName,`n"
    }

    $code += "    }
}"

Set-Content -Path "./VisualGrid/$ClassName.cs" -Value $code
