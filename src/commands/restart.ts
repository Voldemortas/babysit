import {stop} from './stop'
import zod from 'zod'
import {CONFIG_SCHEMA} from '../schema'
import start from './start'

export default async function restart(config: zod.infer<typeof CONFIG_SCHEMA>) {
  try {
    await stop(config, true)
  } catch {}
  return await start(config)
}
