const STOP = new Set(
  `a an the of to and or in on for is it this that you your with from as are be by if not than then we can into its their they them our will just about over after before so at was were been being do does did have has had but which what when who how why each other such only also than per`.split(
    " ",
  ),
)

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length >= 3 && !STOP.has(token))
}

export type Tfidf = {
  idf: Map<string, number>
  vector: (text: string) => Map<string, number>
}

export function fitTfidf(docs: string[]): Tfidf {
  const docsTokens = docs.map((doc) => new Set(tokenize(doc)))
  const df = new Map<string, number>()
  for (const tokens of docsTokens) {
    for (const token of tokens) df.set(token, (df.get(token) ?? 0) + 1)
  }
  const n = Math.max(docs.length, 1)
  const idf = new Map<string, number>()
  for (const [token, count] of df) {
    idf.set(token, Math.log((n + 1) / (count + 1)) + 1)
  }

  const vector = (text: string) => {
    const counts = new Map<string, number>()
    for (const token of tokenize(text)) {
      if (!idf.has(token)) continue
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
    const out = new Map<string, number>()
    for (const [token, count] of counts) {
      out.set(token, count * (idf.get(token) ?? 0))
    }
    return out
  }

  return { idf, vector }
}

export function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0
  let aa = 0
  let bb = 0
  const [small, large] = a.size < b.size ? [a, b] : [b, a]
  for (const value of a.values()) aa += value * value
  for (const value of b.values()) bb += value * value
  for (const [token, value] of small) {
    const other = large.get(token)
    if (other) dot += value * other
  }
  if (aa === 0 || bb === 0) return 0
  return dot / Math.sqrt(aa * bb)
}
