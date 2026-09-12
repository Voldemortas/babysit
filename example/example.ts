const TOTAL_TICKS = 60
const TICK_INTERVAL_MS = 1000

let interval: NodeJS.Timeout
let ticks = 0

interval = setInterval(() => {
  if (ticks >= TOTAL_TICKS) {
    clearInterval(interval)
  } else {
    console.log(ticks++)
  }
}, TICK_INTERVAL_MS)
