import { questionsFor, listConcepts, getConcept } from "./course/catalog"
import type { Concept, Question } from "./course/types"

export type Attempt = {
  questionId: string
  conceptId: string
  correct: boolean
  choice: number
  at: number
}

export type Feedback = {
  questionId: string
  choice: number
  candidateId: string
  y: 0 | 1
  at: number
}

export type Store = {
  attempts: Attempt[]
  feedback: Feedback[]
}

export const EMPTY: Store = { attempts: [], feedback: [] }

const KEY = "upstream.v1"

export type Status = "new" | "shaky" | "solid"

export function statusOf(store: Store, conceptId: string): Status {
  const attempts = store.attempts.filter((attempt) => attempt.conceptId === conceptId)
  if (attempts.length === 0) return "new"
  return attempts[attempts.length - 1].correct ? "solid" : "shaky"
}

export function pickQuestion(store: Store, conceptId: string, exclude?: string): Question | undefined {
  const all = questionsFor(conceptId)
  const pool = all.filter((question) => question.id !== exclude)
  const source = pool.length > 0 ? pool : all
  const correct = new Set(
    store.attempts.filter((attempt) => attempt.correct).map((attempt) => attempt.questionId),
  )
  return (
    source.find((question) => !store.attempts.some((attempt) => attempt.questionId === question.id)) ??
    source.find((question) => !correct.has(question.id)) ??
    source[0]
  )
}

export function continueConcept(store: Store): Concept {
  const concepts = listConcepts()
  return (
    concepts.find((concept) => statusOf(store, concept.id) === "shaky") ??
    concepts.find((concept) => statusOf(store, concept.id) !== "solid") ??
    concepts[concepts.length - 1]
  )
}

export function counts(store: Store): { solid: number; shaky: number; fresh: number } {
  let solid = 0
  let shaky = 0
  let fresh = 0
  for (const concept of listConcepts()) {
    const status = statusOf(store, concept.id)
    if (status === "solid") solid += 1
    else if (status === "shaky") shaky += 1
    else fresh += 1
  }
  return { solid, shaky, fresh }
}

function sanitize(value: unknown): Store {
  if (!value || typeof value !== "object") return EMPTY
  const record = value as Partial<Store>
  const attempts = Array.isArray(record.attempts)
    ? record.attempts.filter(
        (item): item is Attempt =>
          !!item &&
          typeof item === "object" &&
          typeof item.questionId === "string" &&
          typeof item.conceptId === "string" &&
          typeof item.correct === "boolean" &&
          typeof item.choice === "number",
      )
    : []
  const feedback = Array.isArray(record.feedback)
    ? record.feedback.filter(
        (item): item is Feedback =>
          !!item &&
          typeof item === "object" &&
          typeof item.questionId === "string" &&
          typeof item.candidateId === "string" &&
          typeof item.choice === "number" &&
          (item.y === 0 || item.y === 1),
      )
    : []
  return { attempts, feedback }
}

type Snap = { store: Store; ready: boolean }

const serverSnap: Snap = { store: EMPTY, ready: false }
let snap: Snap = serverSnap
const listeners = new Set<() => void>()

function emit(next: Snap) {
  snap = next
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): Snap {
  return snap
}

export function getServerSnapshot(): Snap {
  return serverSnap
}

function persist(store: Store) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // Private mode can refuse storage. The session still works in memory.
  }
}

export function hydrate() {
  if (typeof window === "undefined" || snap.ready) return
  let store = EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) store = sanitize(JSON.parse(raw))
  } catch {
    store = EMPTY
  }
  emit({ store, ready: true })
}

export function recordAttempt(attempt: Omit<Attempt, "at"> & { at?: number }) {
  const store = snap.store
  const saved: Attempt = { ...attempt, at: attempt.at ?? Date.now() }
  const last = store.attempts[store.attempts.length - 1]
  if (
    last &&
    last.questionId === saved.questionId &&
    last.choice === saved.choice &&
    last.correct === saved.correct &&
    saved.at - last.at < 1500
  ) {
    return
  }
  const next = { ...store, attempts: [...store.attempts, saved] }
  persist(next)
  emit({ store: next, ready: true })
}

export function recordFeedback(feedback: Omit<Feedback, "at"> & { at?: number }) {
  const store = snap.store
  const saved: Feedback = { ...feedback, at: feedback.at ?? Date.now() }
  const duplicate = store.feedback.some(
    (item) =>
      item.questionId === saved.questionId &&
      item.candidateId === saved.candidateId &&
      item.y === saved.y &&
      item.choice === saved.choice,
  )
  if (duplicate) return
  const next = { ...store, feedback: [...store.feedback, saved] }
  persist(next)
  emit({ store: next, ready: true })
}

export function resetProgress() {
  persist(EMPTY)
  emit({ store: EMPTY, ready: true })
}

export function rejectedIds(store: Store, questionId: string): Set<string> {
  return new Set(
    store.feedback.filter((item) => item.questionId === questionId && item.y === 0).map((item) => item.candidateId),
  )
}

export function conceptTitle(id: string): string {
  return getConcept(id)?.title ?? "Unknown topic"
}
