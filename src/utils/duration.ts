import {Duration} from '../types'

export default function parseDuration(duration: Duration): number {
  if (typeof duration === 'number') {
    if (duration < 0) {
      throw new Error('Duration must be positive!')
    }
    return duration
  }
  const multipliers = {
    ms: 1,
    s: 1000,
    min: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  }
  const regex = new RegExp(`(${Object.keys(multipliers).join('|')})$`)
  if (!new RegExp(`^\\d+${regex.source}`).test(duration)) {
    throw new Error(`Cannot parse duration of ${duration}`)
  }
  return (
    multipliers[duration.match(regex)![1] as 's'] * +duration.replace(regex, '')
  )
}
