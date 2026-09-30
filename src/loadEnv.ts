import {Config} from 'src/types.ts'

export default function loadEnv(): Partial<Omit<Config, 'envPath' | 'env'>> {
  return Object.fromEntries(
    Object.entries({
      command: JSON.parse(Bun.env.BABYSIT_COMMAND ?? null) ?? undefined,
      workDir: Bun.env.BABYSIT_WORKDIR,
      babysitDir: Bun.env.BABYSIT_BABYSIT_DIR,
      interval: Bun.env.BABYSIT_INTERVAL,
      retention: Bun.env.BABYSIT_RETENTION,
      preserveLogs: Bun.env.BABYSIT_PRESERVE_LOGS,
      env: Bun.env.ENV,
      envPath: Bun.env.ENV_PATH,
      web:
        Bun.env.BABYSIT_PORT === undefined
          ? undefined
          : {
              port: +Bun.env.BABYSIT_PORT,
              disableAuth:
                Bun.env.BABYSIT_USERNAME === undefined ||
                Bun.env.BABYSIT_USERPASS === undefined,
              userName: Bun.env.BABYSIT_USERNAME!,
              userPass: Bun.env.BABYSIT_USERPASS!,
            },
    }).filter((entry) => entry[1] !== undefined)
  )
}
