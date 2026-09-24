import help from 'src/commands/help'
import {describe, expect, it} from 'bun:test'

describe('help command', () => {
  it('shows a correct help message', () => {
    expect(help()).toStrictEqual(`help - shows this very message
start - starts the task
stop - stops the task
restart - restarts the task (same as stop and start)
status - shows status of the task
logs - shows the output logs of the task`)
  })
})
