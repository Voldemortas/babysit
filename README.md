# Babysit

A tool to run and monitor processes on linux with bun.

## Install

Install it as a developer dependency with  
`bunx jsr add @voldemortas/babysit -d`  


Or install it globally with  
`bunx jsr add @voldemortas/babysit -g`

## Set up

To `.gitignore` add
```hgignore
.babysit
```


Create a `babysit.ts` file with a config 
```ts
import babysit, {type Config} from "@voldemortas/babysit";

const config: Config = {
  command: ['bun', 'run', 'src/index.ts'],//or whatever u want to run
  workDir: import.meta.dir,
  babysitDir: import.meta.dir + '/.babysit',//optional, defaults to <workDir>/.babysit
  env: {
    NODE_ENV: 'production',
  },//optional
  //or use
  //envPath: import.meta.dir + '.env',
  
  //resource monitorig
  interval: '5s',//how long to check ram/cpu usage; optional - defaults to '5s'; use 0 to disable
  retention: '24h',//how long to keep ram/cpu usage data; optional - defaults to '24h'; use 0 to keep the last entry only
  //preserveLogs: false;//NOT IMPLEMENTED
  
  //web: {}//NOT IMPLEMENTED
}

babysit(config)
```

update your `package.json` scripts with:  
```jsonlc
"scripts": {
    //some previous scripts
    "babysit": "bun babysit.ts"
}
```

## Use

```bash
bun run babysit help # shows the help message with commands below
bun run babysit start # starts the process
bun run babysit stop # stops the process
bun run babysit restart # restarts the process
bun run babysit status # shows whether the process is running and if it is shows some additional data like cpu/ram/time
bun run babysit status --watch # same as above but keeps on reporting data every second
bun run babysit logs # shows logs of the process
```

## Future tasks

* organise files better
* cover everything in tests
* implement preserve logs
* add an optional web interface with possibility to preview historical usage data, logs and maybe even stop/start/restart the process; with and without authentication

-------
© Andrius Simanaitis, 2026

Licensed under the MIT License. See [LICENSE](./LICENSE).