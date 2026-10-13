import { mulberry32 } from "./rng"

function zeros(n: number): number[] {
  return Array.from({ length: n }, () => 0)
}

function l2(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0))
  if (norm === 0) return vec.slice()
  return vec.map((value) => value / norm)
}

function dist2(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return sum
}

export function kmeans(raw: number[][], k: number, seed = 7): number[] {
  if (raw.length === 0) return []
  const points = raw.map((row) => l2(row))
  const dim = points[0].length
  const clusters = Math.max(1, Math.min(k, points.length))
  const rng = mulberry32(seed)

  const chosen: number[] = [0]
  while (chosen.length < clusters) {
    let best = 0
    let bestDist = -1
    for (let i = 0; i < points.length; i++) {
      if (chosen.includes(i)) continue
      const nearest = Math.min(...chosen.map((index) => dist2(points[i], points[index])))
      const jitter = rng() * 1e-9
      if (nearest + jitter > bestDist) {
        bestDist = nearest + jitter
        best = i
      }
    }
    chosen.push(best)
  }

  let centroids = chosen.map((index) => points[index].slice())
  let labels = points.map(() => 0)

  for (let iter = 0; iter < 30; iter++) {
    labels = points.map((point) => {
      let best = 0
      let bestDist = Infinity
      for (let c = 0; c < centroids.length; c++) {
        const d = dist2(point, centroids[c])
        if (d < bestDist) {
          bestDist = d
          best = c
        }
      }
      return best
    })

    const next = centroids.map(() => zeros(dim))
    const counts = centroids.map(() => 0)
    for (let i = 0; i < points.length; i++) {
      const label = labels[i]
      counts[label] += 1
      for (let d = 0; d < dim; d++) next[label][d] += points[i][d]
    }
    for (let c = 0; c < next.length; c++) {
      if (counts[c] === 0) {
        next[c] = points[chosen[c] % points.length].slice()
      } else {
        for (let d = 0; d < dim; d++) next[c][d] /= counts[c]
        const normed = l2(next[c])
        next[c] = normed
      }
    }
    centroids = next
  }

  return labels
}

/** Dense bag for clustering, shared vocabulary order. */
export function denseVectors(docs: Map<string, number>[], vocab: string[]): number[][] {
  return docs.map((doc) => vocab.map((token) => doc.get(token) ?? 0))
}
