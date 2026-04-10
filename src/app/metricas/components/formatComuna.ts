export default function formatComuna(value: string) {
  const match = /^C0?(\d{1,2})$/i.exec(value.trim())

  if (!match) {
    return value
  }

  return `Comuna ${Number(match[1])}`
}
