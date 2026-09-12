import {CONFIG_SCHEMA} from '../schema'
import zod from 'zod'
import {exists} from 'node:fs/promises'
import parseJSONL from '../utils/parseJSONL'
import bytesToString from '../utils/ram'
import msToString from '../utils/time'

const FILE_NAME = '/babysit.json'

export const STATUS_SCHEMA = zod.object({
  start: zod.coerce.date(),
  id: zod.uuid(),
  processPid: zod.number(),
  monitorPid: zod.number(),
})

export default async function status({
  babysitDir,
}: Pick<zod.infer<typeof CONFIG_SCHEMA>, 'babysitDir'>): Promise<
  | {running: false}
  | {
      id: string
      running: true
      runningTime: string
      processPid: number
      monitorPid: number
      cpu: string
      ram: string
    }
> {
  const filePath = babysitDir + FILE_NAME
  if (!(await exists(babysitDir)) || !(await exists(filePath))) {
    return {running: false}
  }
  const jsonValue = await STATUS_SCHEMA.parseAsync(
    await Bun.file(filePath).json()
  )
  if (
    (await getBabysitId(jsonValue.processPid)) === jsonValue.id &&
    (await getBabysitId(jsonValue.monitorPid)) === jsonValue.id
  ) {
    const {cpu, ram} = (await parseJSONL<
      zod.infer<typeof STATUS_SCHEMA> & {
        running: true
        cpu: string
        ram: string
      }
    >(babysitDir + '/monitor.jsonl', {last: 1}))![0]

    return {
      id: jsonValue.id,
      runningTime: msToString(new Date().getTime() - jsonValue.start.getTime()),
      processPid: jsonValue.processPid,
      monitorPid: jsonValue.monitorPid,
      running: true,
      cpu: `${(+cpu).toPrecision(2)}%`,
      ram: bytesToString(+ram),
    }
  } else {
    return {running: false}
  }
}

export async function getBabysitId(pid: number) {
  try {
    if (!(await exists(`/proc/${pid}/environ`))) {
      return undefined
    }
    const environ = await Bun.file(`/proc/${pid}/environ`).text()

    return environ
      .split('\0')
      .find((entry) => entry.startsWith('BABYSIT_ID='))
      ?.slice('BABYSIT_ID='.length)
  } catch (e) {
    return undefined
  }
}
