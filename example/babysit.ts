import {Config} from '../src'
import babysit from '../src/babysit'

const config: Config = {
  command: ['bun', 'run', `${import.meta.dir}/example.ts`],
  workDir: import.meta.dir,
  babysitDir: import.meta.dir + '/.babysit',
}

await babysit(config)
