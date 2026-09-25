import {CONFIG_SCHEMA} from 'src/schema'
import status, {getBabysitId, STATUS_SCHEMA} from './status'
import zod from 'zod'

const FILE_NAME = '/babysit.json'

export default async function stop(
  config: zod.infer<typeof CONFIG_SCHEMA>,
  forceKill = false
) {
  const wasKilled = await unwrappedStop(config, forceKill)

  if (wasKilled) {
    const filePath = config.babysitDir + FILE_NAME
    const jsonValue = await STATUS_SCHEMA.parseAsync(
      await Bun.file(filePath).json()
    )

    if ((await getBabysitId(jsonValue.monitorPid)) === jsonValue.id) {
      process.kill(jsonValue.monitorPid, 'SIGTERM')
    }
    if (
      !!jsonValue.webPid &&
      (await getBabysitId(jsonValue.webPid)) === jsonValue.id
    ) {
      process.kill(jsonValue.webPid, 'SIGTERM')
    }
  }

  return `Process ${wasKilled ? 'was' : 'was not'} stopped.`
}

export async function unwrappedStop(
  config: zod.infer<typeof CONFIG_SCHEMA>,
  forceKill = false
) {
  let current = await status(config)

  if (!current.running) {
    throw new Error('babysit is not running')
  }

  await verifyProcess(current.processPid, current.id)

  process.kill(current.processPid, 'SIGINT')

  if (await waitForStop(config, 2000)) {
    return true
  }

  if (
    !forceKill &&
    !(await confirm('Process did not stop after SIGINT. Send SIGTERM?'))
  ) {
    return false
  }

  current = await status(config)

  if (!current.running) {
    return true
  }

  await verifyProcess(current.processPid, current.id)

  process.kill(current.processPid, 'SIGTERM')

  if (await waitForStop(config, 2000)) {
    return true
  }

  if (
    !forceKill &&
    !(await confirm('Process did not stop after SIGTERM. Send SIGKILL?'))
  ) {
    return false
  }

  current = await status(config)

  if (!current.running) {
    return true
  }

  await verifyProcess(current.processPid, current.id)

  process.kill(current.processPid, 'SIGKILL')
  return true
}

async function waitForStop(
  config: zod.infer<typeof CONFIG_SCHEMA>,
  timeout: number
) {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    if (!(await status(config)).running) {
      return true
    }

    await Bun.sleep(100)
  }

  return !(await status(config)).running
}

async function verifyProcess(pid: number, id: string) {
  const actualId = await getBabysitId(pid)

  if (actualId !== id) {
    throw new Error(`PID ${pid} is no longer the expected babysit process`)
  }
}

async function confirm(message: string) {
  process.stdout.write(`${message} [y/N] `)

  const reader = Bun.stdin.stream().getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const {value, done} = await reader.read()

      if (done) return false

      const answer = decoder.decode(value).trim().toLowerCase()

      if (answer === 'y') return true
      if (answer === '' || answer === 'n') return false
    }
  } finally {
    reader.releaseLock()
  }
}
