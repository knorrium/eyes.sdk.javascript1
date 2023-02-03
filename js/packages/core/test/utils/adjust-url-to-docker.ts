// This is why we can't have nice things
// https://github.com/docker/compose/issues/3800#issuecomment-496480571
export function adjustUrlToDocker(url: string, {platform = process.platform} = {}) {
  if (platform === 'darwin') return url.replace(/:\/\/localhost/, '://host.docker.internal')
  return url
}
