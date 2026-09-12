export type JSONL_CONFIG<T> =
  | {
      last: number
    }
  | {
      first: number
    }
  | {
      filter: (item: T, index: number) => boolean
    }

export default async function parseJSONL<T>(
  path: string,
  config: JSONL_CONFIG<T> = {last: 1}
) {
  const file = Bun.file(path)
  if (!(await file.exists())) {
    throw new Error('file does not exist')
  }
  if (file.size === 0) {
    return []
  }
  let answer: string[] = []
  if (Object.keys(config).includes('last')) {
    const lines = (config as {last: number}).last
    if (lines <= 0) {
      return []
    }

    const chunkSize = 64 * 1024
    let position = file.size
    let data = ''

    while (position > 0 && data.split('\n').length <= lines) {
      const start = Math.max(0, position - chunkSize)

      data = (await file.slice(start, position).text()) + data
      position = start
    }

    answer = data.split('\n').filter(Boolean).slice(-lines)
  } else if (Object.keys(config).includes('first')) {
    const lines = (config as {first: number}).first
    if (lines <= 0) {
      return []
    }
    let i = 0
    for await (const line of readLines(file.name!)) {
      answer.push(line.replace(/,$/, ''))
      if (++i >= lines) {
        break
      }
    }
  } else {
    let i = 0
    for await (const line of readLines(file.name!)) {
      const parsedLine = line.replace(/,$/, '')
      const parsedItem = JSON.parse(parsedLine) as T
      if (
        (config as {filter: (item: T, id: number) => boolean}).filter(
          parsedItem,
          i++
        )
      ) {
        answer.push(parsedLine)
      }
    }
  }

  return JSON.parse(`[${answer}]`) as T[]
}

async function* readLines(path: string): AsyncGenerator<string> {
  const stream = Bun.file(path).stream().pipeThrough(new TextDecoderStream())

  let buffer = ''

  for await (const chunk of stream) {
    buffer += chunk

    const lines = buffer.split('\n')
    buffer = lines.pop()!

    for (const line of lines) {
      yield line
    }
  }

  if (buffer) {
    yield buffer
  }
}
