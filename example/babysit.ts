import babysit, {type Config, loadEnv} from 'src'

const config: Config = {
  ...loadEnv(),
  workDir: import.meta.dir,
}

await babysit(config)
