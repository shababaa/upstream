export type Module = {
  id: string
  title: string
  courseName: string
}

export type Concept = {
  id: string
  title: string
  moduleId: string
  /** Short line shown in lists and used as part of the text the model reads. */
  summary: string
  /** Original study notes. Paragraphs, not a copy of the course site. */
  paragraphs: string[]
  /** One sentence to leave with. */
  hold: string
  /** Ideas that should be solid before this one. */
  prereqs: string[]
}

export type Choice = {
  text: string
  /** Earlier idea this wrong answer usually means is missing. Null on the correct choice. */
  reveals: string | null
}

export type Question = {
  id: string
  conceptId: string
  prompt: string
  /** Why the correct choice is right, in one sentence. */
  because: string
  /** Index 0 is correct. */
  choices: Choice[]
}
