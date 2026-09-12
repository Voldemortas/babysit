import zod from 'zod'
import parseDuration from './utils/duration'
import {Duration} from './types'
import {parse as parseEnv} from 'dotenv'

export const CONFIG_SCHEMA = zod
  .object({
    workDir: zod.string(),
    babysitDir: zod.string().optional(),
    command: zod.string().array(),
    interval: zod
      .int()
      .positive()
      .or(zod.string().regex(/^\d+(ms|s|min|h|d)$/))
      .optional()
      .default('5s'),
    retention: zod
      .int()
      .positive()
      .or(zod.string().regex(/^\d+(ms|s|min|h|d)$/))
      .optional()
      .default('24h'),
    preserveLogs: zod.boolean().optional().default(false),
    envPath: zod.string().optional(),
    env: zod.record(zod.string(), zod.string()).optional(),
    web: zod
      .object({
        port: zod.int().nonnegative(),
      })
      .and(
        zod
          .object({
            disableAuth: zod.literal(true),
            userName: zod.string().optional(),
            userPass: zod.string().optional(),
          })
          .or(
            zod.object({
              disableAuth: zod.literal(false).optional(),
              userName: zod.string(),
              userPass: zod.string(),
            })
          )
      )
      .optional(),
  })
  .refine(({envPath, env}) => !(envPath && env), {
    message: 'envPath and env cannot be used together',
  })
  .transform(async (obj) => ({
    workDir: obj.workDir,
    babysitDir: !!obj.babysitDir ? obj.babysitDir : `${obj.workDir}/.babysit`,
    command: obj.command,
    interval: parseDuration(obj.interval as Duration),
    retention: parseDuration(obj.retention as Duration),
    preserveLogs: obj.preserveLogs,
    env:
      obj.envPath !== undefined
        ? Bun.file(obj.envPath)
            .text()
            .then(parseEnv)
            .catch((_) => {
              throw new Error(`Failed to parse ${obj.envPath} as the env file`)
            })
        : (obj.env ?? {}),
    web: obj.web,
  }))
