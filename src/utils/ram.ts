const TABLE = ['', 'ki', 'Mi', 'Gi', 'Ti', 'Pi']
const BYTES_IN_PREFIX = 1024

export default function bytesToString(bytes: number) {
  return getBytesToString(bytes, 0)
}

function getBytesToString(bytes: number, divisions = 0) {
  if (bytes > BYTES_IN_PREFIX) {
    return getBytesToString(bytes / 1024, divisions + 1)
  } else {
    return `${bytes.toPrecision(3)} ${TABLE[divisions]}B`
  }
}
