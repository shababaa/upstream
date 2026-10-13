import { ancestors, conceptDocument, distance, getQuestion, listConcepts } from "../course/catalog"
import { questions } from "../course/questions"
import type { Question } from "../course/types"
import { denseVectors, kmeans } from "./cluster"
import { dot, nudge, scoreOf, sigmoid, standardizeRow, trainLogistic, type Trained } from "./logreg"
import { cosine, fitTfidf } from "./text"

export const FEATURES = [
  { key: "bias", label: "Starting score" },
  { key: "ancestor", label: "Sits earlier on the map" },
  { key: "near", label: "Close on the map" },
  { key: "questionWords", label: "Question wording" },
  { key: "cluster", label: "Same note cluster" },
  { key: "answerWords", label: "Your answer's wording" },
  { key: "cross", label: "Wording matches and it is upstream" },
  { key: "self", label: "This is the missed topic" },
] as const

const REASONS: Record<string, string> = {
  ancestor: "It sits on the path of ideas this question depends on.",
  near: "It is close to this question on the course map.",
  questionWords: "The question's wording overlaps this note.",
  cluster: "These notes were grouped together from their wording, separate from the hand-built map.",
  answerWords: "The wording of the answer you picked sits close to this note.",
  cross: "The answer's wording matches, and this idea is also earlier on the map.",
  self: "This is the topic the question was testing.",
}

type Episode = {
  questionId: string
  choice: number
  hole: string
  kind: "upstream" | "self"
  gap: number
}

export type Slice = {
  episodes: number
  ranker: number
  map: number
  text: number
  restudy: number
}

export type Suggestion = {
  conceptId: string
  score: number
  reasons: string[]
  contributions: { key: string; label: string; value: number }[]
}

function buildIndex() {
  const conceptList = listConcepts()
  const docs = conceptList.map((concept) => conceptDocument(concept))
  const tfidf = fitTfidf(docs)
  const vectors = docs.map((doc) => tfidf.vector(doc))
  const vocab = [...tfidf.idf.keys()].sort()
  const labels = kmeans(denseVectors(vectors, vocab), 5, 11)
  const clusterOf = new Map(conceptList.map((concept, index) => [concept.id, labels[index]]))
  const docVec = new Map(conceptList.map((concept, index) => [concept.id, vectors[index]]))
  return { tfidf, clusterOf, docVec, conceptList }
}

const index = buildIndex()

function rawFeatures(question: Question, choice: number, candidateId: string): number[] {
  const dist = distance(question.conceptId, candidateId)
  const isSelf = candidateId === question.conceptId ? 1 : 0
  const isAncestor = dist !== null && dist > 0 ? 1 : 0
  const inverse = dist !== null && dist > 0 ? 1 / dist : 0
  const conceptVec = index.docVec.get(candidateId)
  const questionVec = index.tfidf.vector(question.prompt)
  const choiceVec = index.tfidf.vector(question.choices[choice]?.text ?? "")
  const questionCosine = conceptVec ? cosine(questionVec, conceptVec) : 0
  const choiceCosine = conceptVec ? cosine(choiceVec, conceptVec) : 0
  const sameCluster =
    index.clusterOf.get(question.conceptId) === index.clusterOf.get(candidateId) ? 1 : 0
  const cross = choiceCosine * isAncestor
  return [1, isAncestor, inverse, questionCosine, sameCluster, choiceCosine, cross, isSelf]
}

export function candidateIds(question: Question, choice: number): string[] {
  const ids = new Set<string>()
  ids.add(question.conceptId)
  for (const ancestor of ancestors(question.conceptId)) ids.add(ancestor.id)
  const choiceVec = index.tfidf.vector(question.choices[choice]?.text ?? "")
  const extras = listConcepts()
    .filter((concept) => !ids.has(concept.id))
    .map((concept) => ({
      id: concept.id,
      score: cosine(choiceVec, index.docVec.get(concept.id) ?? new Map()),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
  for (const extra of extras) ids.add(extra.id)
  return [...ids]
}

function episodes(): Episode[] {
  const upstream: Episode[] = []
  for (const question of questions) {
    question.choices.forEach((choice, index) => {
      if (!choice.reveals || index === 0) return
      const gap = distance(question.conceptId, choice.reveals)
      if (gap === null || gap < 2) return
      upstream.push({
        questionId: question.id,
        choice: index,
        hole: choice.reveals,
        kind: "upstream",
        gap,
      })
    })
  }
  const self: Episode[] = questions
    .filter((question) => question.id.endsWith("-1"))
    .map((question) => ({
      questionId: question.id,
      choice: 1,
      hole: question.conceptId,
      kind: "self" as const,
      gap: 0,
    }))
  return [...upstream, ...self]
}

function rankIds(
  question: Question,
  choice: number,
  score: (candidateId: string) => number,
): string[] {
  return candidateIds(question, choice).sort((a, b) => {
    const diff = score(b) - score(a)
    if (Math.abs(diff) > 1e-9) return diff
    return a.localeCompare(b)
  })
}

function recall(rows: Episode[], trained: Trained, which: "ranker" | "map" | "text" | "restudy"): number {
  if (rows.length === 0) return 0
  let hits = 0
  for (const episode of rows) {
    const question = getQuestion(episode.questionId)
    if (!question) continue
    const ranked = rankIds(question, episode.choice, (candidateId) => {
      const raw = rawFeatures(question, episode.choice, candidateId)
      if (which === "ranker") return scoreOf(trained, raw)
      if (which === "map") return raw[2] + raw[1] * 0.01
      if (which === "text") return raw[5]
      return raw[7] * 2 + raw[2]
    })
    if (ranked.slice(0, 3).includes(episode.hole)) hits += 1
  }
  return hits / rows.length
}

function trainOn(rows: Episode[]): Trained {
  const data: { x: number[]; y: 0 | 1 }[] = []
  for (const episode of rows) {
    const question = getQuestion(episode.questionId)
    if (!question) continue
    for (const candidateId of candidateIds(question, episode.choice)) {
      data.push({
        x: rawFeatures(question, episode.choice, candidateId),
        y: candidateId === episode.hole ? 1 : 0,
      })
    }
  }
  return trainLogistic(data)
}

const all = episodes()
const far = all.filter((episode) => episode.kind === "upstream" && episode.gap >= 3)
const near = all.filter((episode) => episode.kind === "upstream" && episode.gap === 2)
const self = all.filter((episode) => episode.kind === "self")
const farTest = far.filter((_, index) => index % 2 === 0)
const farTrain = far.filter((_, index) => index % 2 === 1)
const selfTest = self.filter((_, index) => index % 4 === 0)
const selfTrain = self.filter((_, index) => index % 4 !== 0)

const trained = trainOn([...near, ...farTrain, ...selfTrain])

function slice(rows: Episode[]): Slice {
  return {
    episodes: rows.length,
    ranker: recall(rows, trained, "ranker"),
    map: recall(rows, trained, "map"),
    text: recall(rows, trained, "text"),
    restudy: recall(rows, trained, "restudy"),
  }
}

export const evaluation = {
  far: slice(farTest),
  self: slice(selfTest),
  trainedOn: near.length + farTrain.length + selfTrain.length,
}

export const model = {
  trained,
  clusterOf: index.clusterOf,
}

export function clusterGroups(): { id: number; medoidId: string; conceptIds: string[] }[] {
  const groups = new Map<number, string[]>()
  for (const concept of listConcepts()) {
    const id = index.clusterOf.get(concept.id) ?? 0
    const list = groups.get(id) ?? []
    list.push(concept.id)
    groups.set(id, list)
  }
  return [...groups.entries()]
    .map(([id, conceptIds]) => {
      let medoidId = conceptIds[0]
      let best = -1
      for (const candidate of conceptIds) {
        const vec = index.docVec.get(candidate)
        if (!vec) continue
        const avg =
          conceptIds.reduce((sum, other) => {
            if (other === candidate) return sum
            return sum + cosine(vec, index.docVec.get(other) ?? new Map())
          }, 0) / Math.max(conceptIds.length - 1, 1)
        if (avg > best) {
          best = avg
          medoidId = candidate
        }
      }
      return { id, medoidId, conceptIds }
    })
    .sort((a, b) => a.medoidId.localeCompare(b.medoidId))
}

export function scoreCandidate(
  question: Question,
  choice: number,
  candidateId: string,
  weights: number[] | null,
): { score: number; contributions: Suggestion["contributions"] } {
  const raw = rawFeatures(question, choice, candidateId)
  const standardized = standardizeRow(raw, trained.mean, trained.std)
  const used = weights ?? trained.weights
  const score = sigmoid(dot(used, standardized))
  const contributions = FEATURES.map((feature, index) => ({
    key: feature.key,
    label: feature.label,
    value: index === 0 ? 0 : used[index] * standardized[index],
  })).sort((a, b) => b.value - a.value)
  return { score, contributions }
}

export function reasonsFrom(contributions: Suggestion["contributions"]): string[] {
  const useful = contributions.filter((item) => item.value > 0.02 && REASONS[item.key])
  const top = useful.slice(0, 2)
  if (top.length === 0) {
    return ["The ranker placed this next after weighing the map against the wording."]
  }
  return top.map((item) => REASONS[item.key])
}

export function suggest(questionId: string, choice: number, weights: number[] | null): {
  suggestions: Suggestion[]
  mapOrder: string[]
} {
  const question = getQuestion(questionId)
  if (!question) return { suggestions: [], mapOrder: [] }
  const ranked = candidateIds(question, choice)
    .map((conceptId) => {
      const scored = scoreCandidate(question, choice, conceptId, weights)
      return {
        conceptId,
        score: scored.score,
        contributions: scored.contributions,
        reasons: reasonsFrom(scored.contributions),
      }
    })
    .sort((a, b) => b.score - a.score || a.conceptId.localeCompare(b.conceptId))

  const mapOrder = ancestors(question.conceptId).map((item) => item.id)
  const suggestions = ranked.filter((item) => item.conceptId !== question.conceptId).slice(0, 3)
  return { suggestions, mapOrder }
}

export function replayWeights(
  events: { questionId: string; choice: number; candidateId: string; y: 0 | 1 }[],
): number[] {
  let weights = trained.weights.slice()
  const base = trained.weights
  for (const event of events) {
    const question = getQuestion(event.questionId)
    if (!question) continue
    if (!candidateIds(question, event.choice).includes(event.candidateId)) continue
    const raw = rawFeatures(question, event.choice, event.candidateId)
    const standardized = standardizeRow(raw, trained.mean, trained.std)
    weights = nudge(weights, base, standardized, event.y)
  }
  return weights
}

export function sampleMiss(): { questionId: string; choice: number } {
  const question = questions.find((item) => item.id === "activation-1")
  const choice = question?.choices.findIndex((item) => item.reveals === "loss") ?? 1
  return { questionId: "activation-1", choice: choice > 0 ? choice : 1 }
}
