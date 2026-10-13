"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { getConcept, listConcepts, questionsFor } from "@/lib/course/catalog"
import { orderedChoices } from "@/lib/display"
import { pickQuestion, recordAttempt } from "@/lib/progress"
import { useUpstream } from "@/components/use-upstream"
import { cn } from "cn"

export function CheckView({ conceptId }: { conceptId: string }) {
  const concept = getConcept(conceptId)
  const router = useRouter()
  const { store, ready } = useUpstream()
  const [picked, setPicked] = useState<number | null>(null)
  const [passed, setPassed] = useState<{ because: string; hold: string } | null>(null)

  if (!concept) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-2xl">That topic is not on the map</h1>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to study
        </Link>
      </div>
    )
  }

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading your checks…</p>
  }

  const question = pickQuestion(store, concept.id)
  if (!question) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-2xl">No check for this topic</h1>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to study
        </Link>
      </div>
    )
  }

  const choices = orderedChoices(question)
  const restsOn = concept.prereqs
    .map((id) => getConcept(id))
    .filter((item): item is NonNullable<typeof item> => !!item)
  const concepts = listConcepts()
  const index = concepts.findIndex((item) => item.id === concept.id)
  const neighbor = concepts[index + 1] ?? concepts[0]
  const another = questionsFor(concept.id).find((item) => item.id !== question.id)

  function submit() {
    if (!question || !concept || picked === null) return
    const right = picked === 0
    recordAttempt({
      questionId: question.id,
      conceptId: concept.id,
      correct: right,
      choice: picked,
    })
    if (right) setPassed({ because: question.because, hold: concept.hold })
    else router.push(`/miss?question=${question.id}&choice=${picked}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          All topics
        </Link>
        <h1 className="mt-1 font-serif text-3xl tracking-tight">{concept.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{concept.summary}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {restsOn.length === 0
            ? "Nothing on the map comes before this. A miss here is restudied directly."
            : "Rests on "}
          {restsOn.map((item, i) => (
            <span key={item.id}>
              {i > 0 ? ", " : ""}
              <Link href={`/check/${item.id}`} className="underline decoration-border underline-offset-2 hover:text-foreground">
                {item.title}
              </Link>
            </span>
          ))}
        </p>
      </div>

      {passed ? (
        <section className="rounded-xl border border-border bg-card px-4 py-4">
          <h2 className="font-serif text-xl">That&apos;s the idea</h2>
          <p className="mt-2 text-sm leading-relaxed">{passed.because}</p>
          <p className="mt-2 text-sm text-muted-foreground">{passed.hold}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {another ? (
              <Button
                type="button"
                onClick={() => {
                  setPassed(null)
                  setPicked(null)
                }}
              >
                Another check on this topic
              </Button>
            ) : null}
            <Link href={`/check/${neighbor.id}`} className={buttonVariants()}>
              Next topic: {neighbor.title}
            </Link>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Back to the list
            </Link>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Pick one answer, then press Check answer. A wrong answer opens earlier ideas instead of only repeating this question.
          </p>
          <h2 className="font-serif text-xl leading-snug">{question.prompt}</h2>
          <div className="flex flex-col gap-2">
            {choices.map((choice) => {
              const selected = picked === choice.originalIndex
              return (
                <Button
                  key={choice.originalIndex}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  aria-pressed={selected}
                  onClick={() => setPicked(choice.originalIndex)}
                  className="h-auto w-full justify-start whitespace-normal px-3 py-3 text-left text-sm leading-snug"
                >
                  {choice.text}
                </Button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" disabled={picked === null} onClick={submit} className={cn("h-10 px-4")}>
              Check answer
            </Button>
            <Link href={`/review/${concept.id}`} className="text-sm text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground">
              Read the note first
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
