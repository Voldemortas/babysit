# Babysit

A tool for running and monitoring processes on Linux with Bun.

## Install

Install it as a developer dependency with  
`bunx jsr add @voldemortas/babysit -D`  


Or install it globally with  
`bunx jsr add @voldemortas/babysit -G`

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
  env: {//optional
    NODE_ENV: 'production',
  },
  //or use
  //envPath: import.meta.dir + '.env',
  
  //resource monitorig
  interval: '5s',//how long to check ram/cpu usage; optional - defaults to '5s'; use 0 to disable
  retention: '24h',//how long to keep ram/cpu usage data; optional - defaults to '24h'; use 0 to keep the last entry only
  //preserveLogs: false;//NOT IMPLEMENTED
  
  web: {//optional, if left undefined, then there will be no web monitor server running
    port: Bun.env.BABYSIT_PORT,//port used for web interface. Configure it inside .env or somewherelese; mandatory!
    
    userName: Bun.env.BABYSIT_USERNAME,//same as above; used to login into web interface
    userPass: Bun.env.BABYSIT_PASSWORD,//same as above; used to login into web interface
    
    disableAuth: false//optional, if set to true then userName/userPass is ignored
  }
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
* ~~add an optional web interface with possibility to preview historical usage data, logs~~ and maybe even stop/start/restart the process; with and without authentication

-------
© Andrius Simanaitis, 2026

Licensed under the MIT License. See [LICENSE](./LICENSE).

## Third-party libraries

- [uPlot](https://github.com/leeoniya/uPlot) — charting library, loaded from jsDelivr
- [bun](https://bun.sh) — js runtime