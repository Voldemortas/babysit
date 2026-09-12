import {CONFIG_SCHEMA} from '../schema'
import status from './status'
import zod from 'zod'

export default async function start(config: zod.infer<typeof CONFIG_SCHEMA>) {
  const current = await status(config)

  if (current.running) {
    throw new Error(`babysit is already running (PID ${current.processPid})`)
  }

  const id = crypto.randomUUID()
  await Bun.$`mkdir ${config.babysitDir}`.quiet(true).nothrow()
  await Bun.write(`${config.babysitDir}/out.log`, '')
  await Bun.write(`${config.babysitDir}/error.log`, '')

  const subprocess = Bun.spawn(config.command, {
    cwd: config.workDir,
    env: {
      ...Bun.env,
      ...(await config.env),
      BABYSIT_ID: id,
    },
    stdout: Bun.file(`${config.babysitDir}/out.log`),
    stderr: Bun.file(`${config.babysitDir}/error.log`),
    stdin: 'ignore',
  })

  const monitorProcess = Bun.spawn({
    cmd: ['bun', 'run', import.meta.dir + '/monitor.ts'],
    cwd: config.workDir,
    env: {
      ...Bun.env,
      BABYSIT_ID: id,
      SUBPROCESS_PID: subprocess.pid.toString(),
      BABYSIT_PATH: config.babysitDir,
      BABYSIT_INTERVAL: config.interval.toString(),
      BABYSIT_RETENTION: config.retention.toString(),
    },
    stdin: 'ignore',
    stdout: 'ignore',
    stderr: 'ignore',
  })

  const statusValue = {
    start: new Date(),
    id,
    processPid: subprocess.pid,
    monitorPid: monitorProcess.pid,
  }

  await Bun.write(
    `${config.babysitDir}/babysit.json`,
    JSON.stringify(statusValue)
  )

  subprocess.unref()
  monitorProcess.unref()

  return `The process has been successfully started`
}
