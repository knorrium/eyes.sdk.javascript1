import xml.etree.ElementTree as ET
import os
import re
import datetime
import json

def upSemanticVersion(currentVersion, part):
    versionPattern = r"(?P<major>[0-9]+)\.(?P<minor>[0-9]+)(\.(?P<patch>[0-9]+))?(?P<suffix>-.*)?"
    matches = re.search(versionPattern, currentVersion)
    if matches:
        vMajor = int(matches.group('major'))
        vMinor = int(matches.group('minor'))
        vPatchStr = matches.group('patch')
        if vPatchStr:
            vPatch = int(vPatchStr)
        else:
            vPatch = 0
        vNext = "{}.{}"
        suffix = matches.group('suffix')
        if not suffix:
            suffix = ""
        partPattern = r"(?P<partName>[a-z]+)(\+(?P<increase>[0-9]+))?"
        matches = re.match(partPattern, part)
        if matches:
            vPart = matches.group('partName')
            vIncreaseStr = matches.group('increase')
            if vIncreaseStr:
                vIncrease = int(vIncreaseStr)
            else:
                vIncrease = 1
            if (vPart == "major"):
                vNext = vNext.format(vMajor + vIncrease, 0)
            elif (vPart == "minor"):
                vNext = vNext.format(vMajor, vMinor + vIncrease)
            else:
                vNext = (vNext+".{}").format(vMajor, vMinor, vPatch + 1)
        else:
            vNext = part
    return vNext+suffix

def update_changelogs(changelogs, core_changes, dateStr, part):
    for (p, v) in changelogs.items():
        if v['dependency'] == "js/core":
            if part != "patch":
                changes = core_changes
            else:
                changes = {"headings": [], "version": core_changes['version']}
        else:
            changes = get_release_entries(changelog_contents=changelogs[v["dependency"]]['content'])
        headings = ''
        currentSection = ''
        lastLineSpacer = False
        for h in changes['headings']:
            if h.startswith("### "):
                matches = re.search(r"^### (?P<Section>.*)$", h)
                currentSection = matches["Section"]
                h = h.replace("### ", "#### ")
            if h == "#### Dependencies":
                continue
            if currentSection != "Dependencies":
                h = "  " + h
            if not h or h.isspace():
                if not lastLineSpacer:
                    headings += "\n"
                lastLineSpacer = True
            else:
                headings += h + "\n"
                lastLineSpacer = False
        version = changes['version']
        changelogs[p]["content"] = get_changelog_contents(changelogs[p]["path"])
        updates = f"### Dependencies\n\n* {v['dependency']} bumped to {version}\n{headings}"
        update_changelog(changelogs, p, updates, version, dateStr, part)

def update_changelog(changelogs, p, headings, depVersion, dateStr, part):
    target_heading = get_release_heading(changelogs[p]["content"])['heading']
    prev_ver = get_version_from_heading(target_heading)
    if "versionUpdate" in changelogs[p] and changelogs[p]["versionUpdate"] == "copy":
        if part != "patch":
            version = depVersion
        else:
            version = upSemanticVersion(depVersion, part)
    else:
        version = upSemanticVersion(prev_ver, part)
    package = changelogs[p]["tag"]
    url = f"https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/{package}@{prev_ver}...dotnet/{package}@{version}"

    unreleasedDict = get_entries_for_heading(changelogs[p]['content'], "## Unreleased", False)
    unreleasedEntries = [entry['entry'] for entry in unreleasedDict]
    unreleased = "\n".join(unreleasedEntries)
    unreleasedStripped = unreleased.strip('\n')
    if len(unreleasedStripped) > 0:
        unreleasedStripped += "\n\n"
    changes = f"## [{version}]({url}) ({dateStr})\n\n{unreleasedStripped}{headings}"
    changes = changes.strip('\n')
    dependency = changelogs[p]['dependency']
    if len(unreleasedStripped) > 0:
        changelogs[p]["content"] = changelogs[p]["content"].replace(f"\n## Unreleased\n{unreleased}", f"\n{changes}\n\n")
        changelogs[p]['updated'] = True
    elif version != prev_ver and (dependency == "js/core" or changelogs[dependency]['updated']):
        changelogs[p]["content"] = changelogs[p]["content"].replace(f"# Changelog\n\n", f"# Changelog\n\n{changes}\n\n")
        changelogs[p]['updated'] = True
    else:
        changelogs[p]['updated'] = False
    changelogs[p]['version'] = version
    changelogs[p]['release_notes'] = f"{unreleasedStripped}{headings}"

def update_csproj(name, version_data, release_notes_data):
    xmlfile = name+".DotNet/"+name+".DotNet.csproj"
    tree = ET.parse(xmlfile)
    root = tree.getroot()
    release_notes = root.find('.//PackageReleaseNotes')
    version = root.find('.//Version')
    if release_notes is None:
        print("Could not find the PackageReleaseNotes section in " + xmlfile + "!")
        exit(1)
    if version is None:
        print("Could not find the Version section in " + xmlfile + "!")
        exit(2)
    release_notes.text = release_notes_data
    version.text = version_data
    tree.write(xmlfile)
    print(xmlfile + ": PackageReleaseNotes and Version update done!")

def get_entries_for_heading(changelog_contents, target_heading, include_heading):
    found_entries = []
    heading_found = False
    for index, entry in enumerate(changelog_contents.split('\n')):
        _entry = entry.strip()
        if heading_found and re.match(r'^\s*##[^#]', _entry):
            break
        if heading_found:
            found_entries.append({'entry': entry, 'index': index})
        if _entry == target_heading:
            if include_heading:
                found_entries.append({'entry': entry, 'index': index})
            heading_found = True
    return found_entries

def get_changelog_contents(target_folder):
    changelog_path = os.path.join(target_folder, 'CHANGELOG.md')
    with open(changelog_path, 'r', encoding='utf-8') as file:
        return file.read()

def get_release_entries(changelog_contents=None, target_folder='.', version=None):
    if not changelog_contents:
        changelog_contents = get_changelog_contents(target_folder)
    print(f"get_release_entries: target_folder={target_folder}")
    try:
        release_heading = get_release_heading(changelog_contents, version) 
        target_heading = release_heading['heading']
    except KeyError as err:
        print(f"{err} - release_heading: {release_heading}")
    version = get_version_from_heading(target_heading)
    entries = get_entries_for_heading(changelog_contents, target_heading, False)
    return {"headings": [entry['entry'] for entry in entries], "version": version}

def get_version_from_heading(content, default="1.0.0"):
    matches = re.search(r"^## \[(?P<Version>.*)?\].*$", content)
    if matches:
        return matches["Version"]
    return default

def get_release_heading(changelog_contents, version=None):
    latest_release_heading = {}
    for index, entry in enumerate(changelog_contents.split('\n')):
        _entry = entry.strip()
        if re.match(r'^\s*##[^#]', _entry) and 'Unreleased' not in _entry:
            if not version or version == get_version_from_heading(entry):
                latest_release_heading['heading'] = _entry
                latest_release_heading['index'] = index
                break
    return latest_release_heading

def create_send_mail_json(reported_version, recent_changes):
    f = open("testCoverageGap.txt", "r")
    testCoverageGap = f.read()
    f.close()

    sendMailObj = {
		"sdk": "dotnet",
		"version": reported_version,
		"changeLog": recent_changes,
		"testCoverageGap": testCoverageGap
	}

    specificRecipient = os.environ.get('SPECIFIC_RECIPIENT')
    if specificRecipient is not None:
        sendMailObj["specificRecipient"] = specificRecipient

    return json.dumps(sendMailObj)

def write_new_changelogs(changelogs):
    for p,v in changelogs.items():
        if (p == 'js/core'):
            continue
        f = open(f"{v['path']}/CHANGELOG.md", "w")
        f.write(v['content'])
        f.close()

def write_new_csproj(changelogs):
    for p,v in changelogs.items():
        if p != 'js/core' and v['updated']:
            update_csproj(p, v['version'], v['release_notes'])

if __name__ == '__main__':
    newLines = ""
    updated_projects = []
    new_tags = []
    reported_version = "RELEASE_CANDIDATE"
    core_version = os.environ.get('CORE_VERSION')
    print(f"Core version: {core_version}")
    sem_ver_part = os.environ.get('SEM_VER_PART')
    print(f"Semantic version part to increase: {sem_ver_part}")
    core_changes = get_release_entries(target_folder="../js/packages/core", version=core_version)
    dateStr = datetime.datetime.now().strftime("%Y-%m-%d")
    matrixJson = {"include":[]}

    changelogs = {
        #"js/core": {"path": "../js/packages/core"},
        "Eyes.Image.Core": {"dependency": "js/core", "path": "Eyes.Image.Core.DotNet", "versionUpdate": "copy", "name": "image.core", "tag":"image.core"},
        "Eyes.Images": {"dependency": "Eyes.Image.Core", "path": "Eyes.Images.DotNet", "name": "images", "tag":"images", "report": "coverage-test-reportI.xml", "group":"images"}, 
        "Eyes.Selenium": {"dependency": "Eyes.Images", "path": "Eyes.Selenium.DotNet", "name": "selenium3", "tag":"selenium", "report": "coverage-test-reportS3.xml", "group": "selenium"},
        "Eyes.Selenium4": {"dependency": "Eyes.Images", "path": "Eyes.Selenium4.DotNet", "name": "selenium4", "tag":"selenium4", "report": "coverage-test-reportS4.xml", "group": "selenium"},
        "Eyes.Playwright": {"dependency": "Eyes.Images", "path": "Eyes.Playwright.DotNet", "name": "playwright", "tag":"playwright", "report": "coverage-test-reportP.xml", "group": "selenium"},
        "Eyes.Appium": {"dependency": "Eyes.Selenium", "path": "Eyes.Appium.DotNet", "name": "appium", "tag":"appium", "report": "coverage-test-reportA.xml", "group": "appium"},
        "Eyes.Appium2": {"dependency": "Eyes.Selenium4", "path": "Eyes.Appium2.DotNet", "name": "appium2", "tag":"appium2", "report": "coverage-test-reportA2.xml", "group": "appium"},
    }
  
    if sem_ver_part == None:
        sem_ver_part = "minor"

    update_changelogs(changelogs, core_changes, dateStr, sem_ver_part)

    for (p,v) in changelogs.items():
        if v['updated']:
            new_tags.append('dotnet/' + v['tag'] + "@" + v['version'] + "\n")
            updated_projects.append(p + "\n")
            if v['name'] != 'image.core':
                matrixJson["include"].append(
                    {'name':v['name'], 
                    'report':v['report'], 
                    'group':v['group'],
                    'version':v['version'],
                    'path':v['path']})

    f = open("MATRIX.json", "w")
    f.write(json.dumps(matrixJson))
    f.close()

    f = open("NEW_TAGS.txt", "w")
    f.writelines(new_tags)
    f.close()

    f = open("UPDATED_PROJECTS.txt", "w")
    f.writelines(updated_projects)
    f.close()

    write_new_changelogs(changelogs)
    write_new_csproj(changelogs)