#!/usr/bin/env pwsh
echo "DEPLOY"
# git remote set-url origin https://${GH_TOKEN}@github.com/${GITHUB_ACTION_REPOSITORY}
# git add */*.csproj CHANGELOG.md
# git commit -m 'Updated CHANGELOG and bumped versions.'
# git push origin HEAD:$RELEASE_BRANCH
# while read p; do  echo $p; git tag $p; done <NEW_TAGS.txt
# git push origin HEAD:$RELEASE_BRANCH --tags

foreach($p in Get-Content .\UPDATED_PROJECTS.txt) {
    dotnet pack ./$p.DotNet/$p.DotNet.csproj
}

dotnet nuget push ./PackagesOutput/*.nupkg --source https://api.nuget.org/v3/index.json --api-key ${env:NUGET_API_KEY} --skip-duplicate
