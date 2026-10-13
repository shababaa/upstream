import assert from "node:assert/strict"
import { test } from "node:test"
import { ancestors, distance, getConcept, listConcepts } from "../course/catalog"
import { concepts } from "../course/concepts"
import { questions } from "../course/questions"
import { evaluation, sampleMiss, suggest } from "./model"

test("course graph is complete and acyclic", () => {
  const ids = new Set(concepts.map((concept) => concept.id))
  for (const concept of concepts) {
    for (const prereq of concept.prereqs) {
      assert.ok(ids.has(prereq), `${concept.id} missing prereq ${prereq}`)
      assert.notEqual(prereq, concept.id)
    }
  }
  for (const concept of concepts) {
    const seen = new Set<string>()
    const stack = [...concept.prereqs]
    while (stack.length) {
      const next = stack.pop()
      if (!next || seen.has(next)) continue
      seen.add(next)
      assert.notEqual(next, concept.id, `cycle at ${concept.id}`)
      stack.push(...(getConcept(next)?.prereqs ?? []))
    }
  }
})

test("every concept has two original checks", () => {
  for (const concept of listConcepts()) {
    const mine = questions.filter((question) => question.conceptId === concept.id)
    assert.ok(mine.length >= 2, concept.id)
    for (const question of mine) {
      assert.equal(question.choices[0].reveals, null)
      assert.ok(question.choices.length >= 4)
      assert.ok(question.because.length > 20)
      const texts = new Set(question.choices.map((choice) => choice.text))
      assert.equal(texts.size, question.choices.length)
      for (const choice of question.choices) {
        if (choice.reveals) assert.ok(getConcept(choice.reveals), choice.reveals)
      }
    }
  }
})

test("loss sits far enough under activation that the map's top 3 can miss it", () => {
  const chain = ancestors("activation")
  const loss = chain.find((item) => item.id === "loss")
  assert.ok(loss)
  assert.ok(loss.distance >= 3)
  assert.equal(distance("activation", "loss"), loss.distance)
  assert.ok(!chain.slice(0, 3).some((item) => item.id === "loss"))
})

test("held-out far misses: the ranker beats the course map", () => {
  assert.ok(evaluation.far.episodes >= 6, `only ${evaluation.far.episodes} far episodes`)
  assert.ok(
    evaluation.far.ranker > evaluation.far.map + 0.05,
    `ranker ${evaluation.far.ranker} map ${evaluation.far.map} text ${evaluation.far.text} restudy ${evaluation.far.restudy} n ${evaluation.far.episodes}`,
  )
  assert.ok(evaluation.far.ranker >= evaluation.far.text)
})

test("when the hole is the topic itself, the ranker beats wording alone", () => {
  assert.ok(evaluation.self.episodes >= 4)
  assert.ok(evaluation.self.ranker + 1e-9 >= evaluation.self.restudy)
  assert.ok(
    evaluation.self.ranker > evaluation.self.text,
    `ranker ${evaluation.self.ranker} text ${evaluation.self.text}`,
  )
})

test("a sample activation miss recommends loss ahead of the map", () => {
  const sample = sampleMiss()
  const { suggestions, mapOrder } = suggest(sample.questionId, sample.choice, null)
  assert.ok(suggestions.length >= 1)
  assert.equal(suggestions[0]?.conceptId, "loss")
  assert.notEqual(mapOrder[0], "loss")
  assert.ok(suggestions[0]?.reasons[0])
})
