const LOWERCASE_WORDS = new Set([
  "de",
  "y",
  "o",
  "del",
  "la",
  "el",
  "en",
  "por",
])

export default function formatPrestacion(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (!word) return word
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}
