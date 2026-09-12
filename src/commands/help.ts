const HELP_MESSAGE = `help - shows this very message
start - starts the task
stop - stops the task
restart - restarts the task (same as stop and start)
status - shows status of the task
logs - shows the output logs of the task`

export default function help() {
  return HELP_MESSAGE
}
