interface Log {
  label?: string
  tags?: string[][]
  timestamp?: string
  level?: string
  message: string
}

export function parseLogs(logs: string): Log[] {
  const regexp =
    /^(?<label>[^\s]+) (?:\((?<tags>[^\)]+)\) )?\| (?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)? (?:\[(?<level>[A-Z]+)\s*\])? (?<message>.+)$/

  const lines = logs.split('\n')
  return lines.reduce((logs, line) => {
    const match = line.match(regexp)
    if (match) {
      logs.push({
        ...match.groups,
        tags: match.groups?.tags?.split(' & ').map(tags => tags.split('/')),
      } as Log)
    } else if (logs[logs.length - 1]) {
      logs[logs.length - 1].message += line
    }
    return logs
  }, [] as Log[])
}

export function structureLogs(logs: Log[]) {
  const groups = {} as any
  logs.forEach(log => {
    const tags = log.tags ?? [[]]
    tags.forEach(tags => {
      const group = tags.reduce((object, key) => {
        object[key] ??= {}
        return object[key]
      }, groups)
      group.logs ??= []
      group.logs.push(log)
    })
  })

  return groups
}
