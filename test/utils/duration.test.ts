import parseDuration from 'src/utils/duration'
import {describe, expect, it} from 'bun:test'

describe('parse duration', () => {
  it('parses number directly', () => {
    expect(parseDuration(362)).toStrictEqual(362)
  })
  it('parses ms correctly', () => {
    expect(parseDuration('360ms')).toStrictEqual(360)
  })
  it('parses s correctly', () => {
    expect(parseDuration('3s')).toStrictEqual(3 * 1000)
  })
  it('parses m correctly', () => {
    expect(parseDuration('3min')).toStrictEqual(3 * 1000 * 60)
  })
  it('parses h correctly', () => {
    expect(parseDuration('2h')).toStrictEqual(2 * 1000 * 60 * 60)
  })
  it('parses d correctly', () => {
    expect(parseDuration('1d')).toStrictEqual(1000 * 60 * 60 * 24)
  })
  it('throws error on wrong formats', () => {
    //@ts-ignore
    expect(() => parseDuration('5w')).toThrowError()
    //@ts-ignore
    expect(() => parseDuration('s')).toThrowError()
  })
  it('throws on negative duration', () => {
    expect(() => parseDuration(-1)).toThrowError()
    expect(() => parseDuration('-1d')).toThrowError()
  })
})
