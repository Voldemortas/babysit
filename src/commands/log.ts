import {CONFIG_SCHEMA} from 'src/schema'
import zod from 'zod'

export default async function log(config: zod.infer<typeof CONFIG_SCHEMA>) {
  const logPath = config.babysitDir + '/out.log'
  const errorPath = config.babysitDir + '/error.log'

  return Bun.$`tail -f ${logPath} ${errorPath}`
}
