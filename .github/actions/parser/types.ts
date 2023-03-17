export interface Job {
  name: string,
  displayName: string,
  packageName: string,
  artifactName: string,
  dirname: string,
  path: string,
  tag: string,
  params?: {
    version?: string,
    runner?: string,
    node?: string,
    links?: string,
    env?: Record<string, string>,
  }
  requested: boolean,
}

export interface Package {
  name: string
  aliases: string[]
  jobName: string
  dirname: string
  path: string
  tag: string
  dependencies: string[]
  framework?: string
}
