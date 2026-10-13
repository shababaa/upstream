export type Trained = {
  weights: number[]
  mean: number[]
  std: number[]
}

export function sigmoid(z: number): number {
  if (z > 30) return 1
  if (z < -30) return 0
  return 1 / (1 + Math.exp(-z))
}

export function dot(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

export function standardizeRow(raw: number[], mean: number[], std: number[]): number[] {
  return raw.map((value, index) => {
    if (index === 0) return 1
    const scale = std[index] < 1e-8 ? 1 : std[index]
    return (value - mean[index]) / scale
  })
}

export function trainLogistic(
  rows: { x: number[]; y: 0 | 1 }[],
  opts: { lr?: number; epochs?: number; l2?: number } = {},
): Trained {
  const lr = opts.lr ?? 0.4
  const epochs = opts.epochs ?? 400
  const l2 = opts.l2 ?? 0.02
  const dim = rows[0]?.x.length ?? 1
  const mean = Array.from({ length: dim }, () => 0)
  const std = Array.from({ length: dim }, () => 1)
  for (let j = 1; j < dim; j++) {
    const col = rows.map((row) => row.x[j])
    const avg = col.reduce((sum, value) => sum + value, 0) / Math.max(col.length, 1)
    const variance =
      col.reduce((sum, value) => sum + (value - avg) ** 2, 0) / Math.max(col.length, 1)
    mean[j] = avg
    std[j] = Math.sqrt(variance)
  }

  const data = rows.map((row) => ({
    x: standardizeRow(row.x, mean, std),
    y: row.y,
  }))
  const pos = data.filter((row) => row.y === 1).length
  const neg = data.length - pos
  const posWeight = pos === 0 ? 1 : neg / pos

  const weights = Array.from({ length: dim }, () => 0)
  for (let epoch = 0; epoch < epochs; epoch++) {
    const grad = Array.from({ length: dim }, () => 0)
    for (const row of data) {
      const p = sigmoid(dot(weights, row.x))
      const scale = row.y === 1 ? posWeight : 1
      const err = (p - row.y) * scale
      for (let j = 0; j < dim; j++) grad[j] += err * row.x[j]
    }
    for (let j = 0; j < dim; j++) {
      const penalty = j === 0 ? 0 : l2 * weights[j]
      weights[j] -= lr * (grad[j] / data.length + penalty)
    }
  }

  return { weights, mean, std }
}

export function scoreOf(model: Trained, raw: number[]): number {
  return sigmoid(dot(model.weights, standardizeRow(raw, model.mean, model.std)))
}

/** One gradient step on an already standardized row, clamped near the base weights. */
export function nudge(
  weights: number[],
  base: number[],
  standardized: number[],
  y: 0 | 1,
  lr = 0.15,
): number[] {
  const p = sigmoid(dot(weights, standardized))
  const err = p - y
  return weights.map((weight, index) => {
    const next = weight - lr * err * standardized[index]
    const lo = base[index] - 0.45
    const hi = base[index] + 0.45
    return Math.min(hi, Math.max(lo, next))
  })
}
