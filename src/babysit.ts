import {Config} from './types'
import zod from 'zod'
import {CONFIG_SCHEMA} from './schema'
import {help, status, start, stop, restart, log} from './commands'

const ARGV2_SCHEMA = zod.enum(
  ['help', 'start', 'stop', 'restart', 'status', 'logs'],
  {
    error: 'Expected one of: help, start, stop, restart, status, logs',
  }
)

export default async function wrappedBabysit(config: Config) {
  try {
    await babysit(config)
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }
}

export async function babysit(config: Config) {
  const argv2 = ARGV2_SCHEMA.safeParse(Bun.argv[2])
  if (!argv2.success) {
    throw new Error(
      `${argv2.error.issues[0].message}.\nFound: "${Bun.argv[2]}"`
    )
  }
  const parsed = await CONFIG_SCHEMA.safeParseAsync(config)
  if (!parsed.success) {
    throw new Error(
      `Something's wrong with config's "${parsed.error.issues[0].path}" argument.`
    )
  }

  switch (argv2.data) {
    case 'help':
      return console.log(help())
    case 'start':
      return console.log(await start(parsed.data))
    case 'restart':
      return console.log(await restart(parsed.data))
    case 'stop':
      return console.log(await stop(parsed.data))
    case 'status': {
      if (Bun.argv[3] === '--watch') {
        let first = true

        while (true) {
          const outputData = await status(parsed.data)
          const outputHeight = Object.keys(outputData).length + 2

          if (!first) {
            process.stdout.write(`\x1b[${outputHeight}A`)

            for (let i = 0; i < outputHeight; i++) {
              process.stdout.write('\x1b[2K')
              if (i < outputHeight - 1) {
                process.stdout.write('\x1b[1B')
              }
            }

            process.stdout.write(`\x1b[${outputHeight - 1}A`)
          }

          console.log(outputData)
          process.stdout.write('\x1b[2K')

          first = false
          await Bun.sleep(1000)
        }
      } else {
        return console.log(await status(parsed.data))
      }
    }
    case 'logs':
      await log(parsed.data)
  }
}
