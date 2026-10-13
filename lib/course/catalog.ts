import { concepts, modules } from "./concepts"
import { questions } from "./questions"
import type { Concept, Module, Question } from "./types"

const conceptById = new Map(concepts.map((concept) => [concept.id, concept]))
const questionById = new Map(questions.map((question) => [question.id, question]))
const order = new Map(concepts.map((concept, index) => [concept.id, index]))

export function listConcepts(): Concept[] {
  return concepts
}

export function listModules(): { module: Module; concepts: Concept[] }[] {
  return modules.map((module) => ({
    module,
    concepts: concepts.filter((concept) => concept.moduleId === module.id),
  }))
}

export function getConcept(id: string): Concept | undefined {
  return conceptById.get(id)
}

export function getQuestion(id: string): Question | undefined {
  return questionById.get(id)
}

export function questionsFor(conceptId: string): Question[] {
  return questions.filter((question) => question.conceptId === conceptId)
}

export function conceptOrder(id: string): number {
  return order.get(id) ?? 0
}

export function prereqIds(id: string): string[] {
  return conceptById.get(id)?.prereqs ?? []
}

/** Shortest path from `from` back along prerequisites to `target`. 0 if they are the same. */
export function distance(from: string, target: string): number | null {
  if (from === target) return 0
  const queue: { id: string; dist: number }[] = [{ id: from, dist: 0 }]
  const seen = new Set<string>([from])
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    for (const prereq of prereqIds(current.id)) {
      if (prereq === target) return current.dist + 1
      if (!seen.has(prereq)) {
        seen.add(prereq)
        queue.push({ id: prereq, dist: current.dist + 1 })
      }
    }
  }
  return null
}

export function ancestors(id: string): { id: string; distance: number }[] {
  const found: { id: string; distance: number }[] = []
  const queue: { id: string; dist: number }[] = [{ id, dist: 0 }]
  const seen = new Set<string>([id])
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    for (const prereq of prereqIds(current.id)) {
      if (seen.has(prereq)) continue
      seen.add(prereq)
      const dist = current.dist + 1
      found.push({ id: prereq, distance: dist })
      queue.push({ id: prereq, dist })
    }
  }
  return found.sort((a, b) => a.distance - b.distance || conceptOrder(a.id) - conceptOrder(b.id))
}

export function conceptDocument(concept: Concept): string {
  return [concept.title, concept.summary, concept.hold, ...concept.paragraphs].join(" ")
}
