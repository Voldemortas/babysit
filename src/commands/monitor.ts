import {appendFile} from 'node:fs/promises'

const TICKS_PER_SECOND = +(await Bun.$`getconf CLK_TCK`).text().trim()
const ROLLING_WINDOW_RATIO = 1.25

await runMonitor()

async function runMonitor() {
  const babysitDir = Bun.env.BABYSIT_PATH!
  const pid = +Bun.env.SUBPROCESS_PID!
  const interval = +Bun.env.BABYSIT_INTERVAL!
  const retention = +Bun.env.BABYSIT_RETENTION!
  const maxLines = Math.ceil(retention / interval)
  const extendedMaxLines = Math.ceil(maxLines * ROLLING_WINDOW_RATIO)

  const filePath = `${babysitDir}/monitor.jsonl`

  await Bun.write(filePath, '')

  let previous = await getCpuSample(pid)

  if (!previous) {
    return
  }

  let linesCount = 0

  try {
    while (true) {
      await Bun.sleep(interval)

      const current = await getCpuSample(pid)

      if (!current) {
        break
      }

      const cpu = calculateCpu(previous, current)
      const ram = await getRam(pid)

      await appendFile(
        filePath,
        JSON.stringify({
          time: new Date(),
          cpu,
          ram,
        }) + '\n'
      )

      if (++linesCount > extendedMaxLines) {
        await Bun.$`tail -n +${extendedMaxLines - maxLines + 1} ${filePath} > ${filePath}.tmp && mv ${filePath}.tmp ${filePath}`

        linesCount -= extendedMaxLines - maxLines
      }

      previous = current
    }
  } finally {
  }
}

async function getCpuSample(pid: number) {
  try {
    const stat = await Bun.file(`/proc/${pid}/stat`).text()

    const closingParen = stat.lastIndexOf(')')

    if (closingParen === -1) {
      return undefined
    }

    const fields = stat
      .slice(closingParen + 2)
      .trim()
      .split(/\s+/)

    const utime = Number(fields[11])
    const stime = Number(fields[12])

    if (!Number.isFinite(utime) || !Number.isFinite(stime)) {
      return undefined
    }

    return {
      cpuTime: utime + stime,
      time: performance.now(),
    }
  } catch {
    return undefined
  }
}

function calculateCpu(
  previous: {
    cpuTime: number
    time: number
  },
  current: {
    cpuTime: number
    time: number
  }
) {
  const cpuSeconds = (current.cpuTime - previous.cpuTime) / TICKS_PER_SECOND

  const wallSeconds = (current.time - previous.time) / 1000

  if (wallSeconds <= 0) {
    return 0
  }

  return (cpuSeconds / wallSeconds) * 100
}

async function getRam(pid: number) {
  try {
    const status = await Bun.file(`/proc/${pid}/status`).text()

    const match = status.match(/^VmRSS:\s+(\d+)\s+kB$/m)

    if (!match) {
      return 0
    }

    return Number(match[1]) * 1024
  } catch {
    return 0
  }
}

export {}
