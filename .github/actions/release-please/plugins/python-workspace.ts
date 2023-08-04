import {type ReleasePullRequest} from 'release-please/build/src/release-pull-request'
import {type CandidateReleasePullRequest} from 'release-please/build/src/manifest'
import {
  WorkspacePlugin,
  addPath,
  appendDependenciesSectionToChangelog,
  type DependencyGraph,
  type DependencyNode,
} from 'release-please/build/src/plugins/workspace'
import {Version, type VersionsMap} from 'release-please/build/src/version'
import {BranchName} from 'release-please/build/src/util/branch-name'
import {PullRequestTitle} from 'release-please/build/src/util/pull-request-title'
import {PullRequestBody} from 'release-please/build/src/util/pull-request-body'
import {PatchVersionUpdate} from 'release-please/build/src/versioning-strategy'
import {Changelog} from 'release-please/build/src/updaters/changelog'
import {RawContent} from 'release-please/build/src/updaters/raw-content'
import * as INI from 'ini'

export interface PythonPackage {
  path: string
  name: string
  version: string
  dependencies: Record<string, string>
  rawManifest: string
  original?: PythonPackage
}

export class PythonWorkspace extends WorkspacePlugin<PythonPackage> {
  protected inScope(candidate: CandidateReleasePullRequest): boolean {
    return candidate.config.releaseType === 'python'
  }

  protected packageNameFromPackage(pkg: PythonPackage): string {
    return pkg.name
  }

  protected pathFromPackage(pkg: PythonPackage): string {
    return pkg.path
  }

  protected bumpVersion(pkg: PythonPackage): Version {
    const version = Version.parse(pkg.version)
    return new PatchVersionUpdate().bump(version)
  }

  protected async buildAllPackages(
    candidates: CandidateReleasePullRequest[]
  ): Promise<{
    allPackages: PythonPackage[]
    candidatesByPackage: Record<string, CandidateReleasePullRequest>
  }> {
    const candidatesByPath = new Map<string, CandidateReleasePullRequest>()
    for (const candidate of candidates) {
      candidatesByPath.set(candidate.path, candidate)
    }
    const candidatesByPackage: Record<string, CandidateReleasePullRequest> = {}

    const packagesByPath = new Map<string, PythonPackage>()
    for (const path in this.repositoryConfig) {
      const config = this.repositoryConfig[path]
      if (config.releaseType !== 'python') continue
      const candidate = candidatesByPath.get(path)
      if (candidate) {
        this.logger.debug(`Found candidate pull request for path: ${candidate.path}`)
        const manifestPath = addPath(candidate.path, 'setup.cfg')
        const packageUpdate = candidate.pullRequest.updates.find(update => update.path === manifestPath)
        if (packageUpdate?.cachedFileContents) {
          const pkg = parsePackage(packageUpdate.cachedFileContents.parsedContent, candidate.path)
          packagesByPath.set(candidate.path, pkg)
          candidatesByPackage[pkg.name] = candidate
        } else {
          const contents = await this.github.getFileContentsOnBranch(manifestPath, this.targetBranch)
          const pkg = parsePackage(contents.parsedContent, candidate.path)
          packagesByPath.set(candidate.path, pkg)
          candidatesByPackage[pkg.name] = candidate
        }
      } else {
        const manifestPath = addPath(path, 'setup.cfg')
        this.logger.debug(`No candidate pull request for path: ${path} - inspect package from ${manifestPath}`)
        const contents = await this.github.getFileContentsOnBranch(manifestPath, this.targetBranch)
        packagesByPath.set(path, parsePackage(contents.parsedContent, path))
      }
    }
    const allPackages = Array.from(packagesByPath.values())

    return {allPackages, candidatesByPackage}
  }

  protected async buildGraph(
    allPackages: PythonPackage[]
  ): Promise<DependencyGraph<PythonPackage>> {
    const packageNames = new Set(allPackages.map(pkg => this.packageNameFromPackage(pkg)))
    return new Map<string, DependencyNode<PythonPackage>>(allPackages.map(pkg => [
      this.packageNameFromPackage(pkg),
      {deps: Object.keys(pkg.dependencies).filter(dep => packageNames.has(dep)), value: pkg}
    ]))
  }

  protected newCandidate(
    pkg: PythonPackage,
    updatedVersions: VersionsMap
  ): CandidateReleasePullRequest {
    const updatedPackage = clonePackage(pkg)
    // Update version of the package
    const newVersion = updatedVersions.get(this.packageNameFromPackage(updatedPackage))
    if (newVersion) {
      this.logger.info(`Updating ${updatedPackage.name} to ${newVersion.toString()}`)
      updatedPackage.version = newVersion.toString()
    }
    // Update dependency versions
    for (const depName of Object.keys(updatedPackage.dependencies)) {
      const updatedDepVersion = updatedVersions.get(depName)
      if (updatedDepVersion) {
        updatedPackage.dependencies[depName] = `==${updatedDepVersion.toString()}`
        this.logger.info(
          `${pkg.name}.${depName} updated to ==${updatedDepVersion.toString()}`
        )
      }
    }
    const version = Version.parse(updatedPackage.version)
    const dependencyNotes = getChangelogDepsNotes(pkg, updatedPackage)
    const pullRequest: ReleasePullRequest = {
      title: PullRequestTitle.ofTargetBranch(this.targetBranch),
      body: new PullRequestBody([{
        component: updatedPackage.name,
        version,
        notes: appendDependenciesSectionToChangelog('', dependencyNotes, this.logger),
      }]),
      updates: [
        {
          path: addPath(updatedPackage.path, 'setup.cfg'),
          createIfMissing: false,
          updater: new RawContent(stringifyPackage(updatedPackage)),
        },
        {
          path: addPath(updatedPackage.path, 'CHANGELOG.md'),
          createIfMissing: false,
          updater: new Changelog({
            version,
            changelogEntry: appendDependenciesSectionToChangelog('', dependencyNotes, this.logger),
          }),
        },
      ],
      labels: [],
      headRefName: BranchName.ofTargetBranch(this.targetBranch).toString(),
      version,
      draft: false,
    }
    return {path: updatedPackage.path, pullRequest, config: {releaseType: 'python'}}
  }

  protected updateCandidate(
    existingCandidate: CandidateReleasePullRequest,
    pkg: PythonPackage,
    updatedVersions: VersionsMap
  ): CandidateReleasePullRequest {
    const updatedPackage = clonePackage(pkg)
    // Update version of the package
    const newVersion = updatedVersions.get(this.packageNameFromPackage(updatedPackage))
    if (newVersion) {
      this.logger.info(`Updating ${updatedPackage.name} to ${newVersion.toString()}`)
      updatedPackage.version = newVersion.toString()
    }
    // Update dependency versions
    for (const depName of Object.keys(updatedPackage.dependencies)) {
      const updatedDepVersion = updatedVersions.get(depName)
      if (updatedDepVersion) {
        updatedPackage.dependencies[depName] = `==${updatedDepVersion.toString()}`
        this.logger.info(
          `${pkg.name}.${depName} updated to ==${updatedDepVersion.toString()}`
        )
      }
    }
    const dependencyNotes = getChangelogDepsNotes(pkg, updatedPackage)
    existingCandidate.pullRequest.updates =
      existingCandidate.pullRequest.updates.map(update => {
        if (update.path === addPath(existingCandidate.path, 'setup.cfg')) {
          update.updater = new RawContent(stringifyPackage(updatedPackage));
        } else if (update.updater instanceof Changelog && dependencyNotes) {
          update.updater.changelogEntry = appendDependenciesSectionToChangelog(update.updater.changelogEntry, dependencyNotes, this.logger)
        }
        return update;
      });

    if (dependencyNotes) {
      if (existingCandidate.pullRequest.body.releaseData.length > 0) {
        existingCandidate.pullRequest.body.releaseData[0].notes =
          appendDependenciesSectionToChangelog(
            existingCandidate.pullRequest.body.releaseData[0].notes,
            dependencyNotes,
            this.logger
          );
      } else {
        existingCandidate.pullRequest.body.releaseData.push({
          component: updatedPackage.name,
          version: existingCandidate.pullRequest.version,
          notes: appendDependenciesSectionToChangelog(
            '',
            dependencyNotes,
            this.logger
          ),
        });
      }
    }
    return existingCandidate;
  }

  protected postProcessCandidates(
    candidates: CandidateReleasePullRequest[],
    _updatedVersions: VersionsMap
  ): CandidateReleasePullRequest[] {
    // NOP for python workspaces
    return candidates;
  }
}

function parsePackage(manifest: string, path: string): PythonPackage {
  const sanitizedManifest = manifest.replace(/install_requires =\s*\n(.*?)(?=\n[^\t\s])/s, (_, requires) => {
    return requires.replace(/^[\s\t]+/gm, 'install_requires[] = ')
  })
  const data = INI.parse(sanitizedManifest)
  return {
    path,
    name: data.metadata.name,
    version: data.metadata.version,
    dependencies: (data.options.install_requires as string[] ?? []).reduce((dependencies, dependency) => {
      const match = dependency.match(/^(?<name>.*?)(?<version>[<=>].*?)?$/)
      if (match) dependencies[match.groups!.name] = match.groups!.version || ''
      return dependencies
    }, {} as Record<string, string>),
    rawManifest: manifest,
  }
}

function clonePackage(pkg: PythonPackage): PythonPackage {
  return {...pkg, dependencies: {...pkg.dependencies}, original: pkg}
}

function stringifyPackage(pkg: PythonPackage): string {
  let manifest = pkg.rawManifest
  if (pkg.original) {
    if (pkg.version !== pkg.original.version) {
      manifest = manifest.replace(`version = ${pkg.original.version}`, `version = ${pkg.version}`)
    }
    for (const [name, version] of Object.entries(pkg.dependencies)) {
      if (version !== pkg.original.dependencies[name]) {
        manifest = manifest.replace(`${name}${pkg.original.dependencies[name]}`, `${name}${version}`)
      }
    }
  }
  return manifest
}

function getChangelogDepsNotes(original: PythonPackage, updated: PythonPackage): string {
  const depUpdateNotes = Object.keys(updated.dependencies).reduce((notes, depName) => {
    if (updated.dependencies[depName] !== original.dependencies[depName]) {
      notes += `\n  * ${depName} bumped to ${updated.dependencies[depName].replace(/^[<=>]+/, '')}`
    }
    return notes
  }, '')

  return depUpdateNotes ? `* The following workspace dependencies were updated${depUpdateNotes}` : ''
}