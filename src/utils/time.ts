const MAP = {
  ms: 1,
  s: 1000,
  min: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
}

export default function msToString(time: number) {
  const sortedMap = Object.entries(MAP).toReversed()
  let answer = ''
  for (let i = 0; i < sortedMap.length - 1; i++) {
    const d = Math.floor(time / sortedMap[i][1])
    if (d > 0) {
      answer += `${d}${sortedMap[i][0]} `
    }
    time -= d * sortedMap[i][1]
  }
  return answer.replace(/ $/, '')
}
