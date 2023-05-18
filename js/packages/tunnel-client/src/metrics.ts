import * as os from 'os'

export function extractCurrentUsage() {
  const memoryUsage = process.memoryUsage()
  const cpus = os.cpus().reduce(
    (cpus, cpu) => {
      cpus.total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq + cpu.times.idle
      cpus.idle += cpu.times.idle
      return cpus
    },
    {total: 0, idle: 0},
  )

  return {
    cpuUsage: 1 - cpus.idle / cpus.total,
    systemRamUsage: os.totalmem() - os.freemem(),
    processRamUsage: memoryUsage.rss,
    processHeepUsage: memoryUsage.heapUsed,
  }
}

export function extractEnvInfo() {
  return {
    os: os.type(),
    hostname: os.hostname(),
    arch: os.arch(),
    ram: os.totalmem(),
    node: process.version,
  }
}
