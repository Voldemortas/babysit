/**
 * Configuration for a babysit-managed process.
 *
 * Exactly one of `envPath` or `env` may be provided.
 *
 * @property workDir - Working directory in which the managed process is started.
 * @property babysitDir - Directory used by babysit for its own data.
 *   Defaults to `<workDir>/.babysit/`.
 * @property command - Command and arguments used to start the process.
 * @property interval - CPU/RAM monitoring interval. `0` disables monitoring.
 *   Defaults to `5s`.
 * @property retention - How long CPU/RAM usage history is retained.
 *   If `0` or less than `interval`, only the latest measurements are retained.
 *   Defaults to '24'
 * @property preserveLogs - Whether to preserver previous logs upon (re)starting.
 *   Defaults to `false`.
 * @property envPath - Path to a file containing environment variables.
 * @property env - Environment variables to pass directly to the managed process.
 * @property web - Configuration for the babysit web interface.
 * @property web.port - Port on which the web interface listens.
 * @property web.disableAuth - Whether authentication is disabled.
 *   Defaults to `false`.
 * @property web.userName - Username required to access the web interface.
 *   Required when authentication is enabled.
 * @property web.userPass - Password required to access the web interface.
 *   Required when authentication is enabled.
 * @example
 * const config: Config = {
 *   workDir: import.meta.dir,
 *   command: ['bun', 'run', 'src/index.ts'],
 *   envPath: import.meta.dir + '/.env.prod',
 *   web: {
 *     port: Bun.env.MONITOR_PORT ?? 6712,
 *     userName: Bun.env.MONITOR_USER,
 *     userPass: Bun.env.MONITOR_PASS,
 *   }
 * }
 */
export type Config = {
  workDir: string
  babysitDir?: string
  command: string[]
  interval?: Duration
  retention?: Duration
  preserveLogs?: boolean
} & (
  | {envPath?: string; env?: never}
  | {env?: Record<string, string>; envPath?: never}
) & {
    web?: {
      port: number
    } & (
      | {
          disableAuth: true
          userName?: string
          userPass?: string
        }
      | {
          disableAuth?: false
          userName: string
          userPass: string
        }
    )
  }

/**
 * A duration represented either as milliseconds or a human-readable string.
 *
 * String values support `ms`, `s`, `m`, `h`, and `d`.
 *
 * @example
 * 1000
 * '5s'
 * '24h'
 */
export type Duration = number | `${number}${'ms' | 's' | 'min' | 'h' | 'd'}`
