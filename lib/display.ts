import type { Question } from "./course/types"
import { hashString, mulberry32 } from "./ml/rng"

export function orderedChoices(question: Question): { text: string; originalIndex: number }[] {
  const items = question.choices.map((choice, originalIndex) => ({
    text: choice.text,
    originalIndex,
  }))
  const rng = mulberry32(hashString(question.id))
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const swap = items[i]
    items[i] = items[j]
    items[j] = swap
  }
  return items
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}
