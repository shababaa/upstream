"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useUpstream } from "@/components/use-upstream"
import { getConcept, getQuestion } from "@/lib/course/catalog"
import { suggest } from "@/lib/ml/model"
import { conceptTitle, recordFeedback, rejectedIds } from "@/lib/progress"
import { cn } from "cn"

export function MissView() {
  const params = useSearchParams()
  const questionId = params.get("question") ?? ""
  const choice = Number(params.get("choice") ?? "-1")
  const question = getQuestion(questionId)
  const concept = question ? getConcept(question.conceptId) : undefined
  const { store, ready, weights } = useUpstream()
  const [note, setNote] = useState("")

  if (!question || !concept || !Number.isInteger(choice) || choice <= 0 || choice >= question.choices.length) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-2xl">That miss is not on record</h1>
        <p className="text-sm text-muted-foreground">Open a topic and answer a check. A wrong answer lands here.</p>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "self-start")}>
          Back to study
        </Link>
    </div>
    )
  }

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading your checks…</p>
  }

  const picked = question.choices[choice]
  const { suggestions, mapOrder } = suggest(question.id, choice, weights)
  const mapFirst = mapOrder[0] ? conceptTitle(mapOrder[0]) : null
  const rankerFirst = suggestions[0] ? conceptTitle(suggestions[0].conceptId) : null
  const rejected = rejectedIds(store, question.id)

  function reject(candidateId: string) {
    recordFeedback({
      questionId: question!.id,
      choice,
      candidateId,
      y: 0,
    })
    setNote(`Noted. The ranker will lean away from ${conceptTitle(candidateId)} for a miss like this one.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/check/${concept.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          Back to {concept.title}
        </Link>
        <h1 className="mt-1 font-serif text-3xl tracking-tight">Missed: {concept.title}</h1>
      </div>

      <section className="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed">
        <p className="font-medium">How to read this page</p>
        <ol className="mt-1 flex flex-col gap-1 text-muted-foreground">
          <li>1. The gray box is what a flashcard app would do: repeat this topic.</li>
          <li>2. The cards under it are earlier ideas. Each one says why it was suggested.</li>
          <li>3. Review one idea, or mark it as the wrong hole. A rejection updates the ranker in this browser.</li>
        </ol>
      </section>

      <section className="flex flex-col gap-2 text-sm leading-relaxed">
        <p className="font-serif text-lg text-foreground">{question.prompt}</p>
        <p>
          <span className="text-muted-foreground">You picked: </span>
          {picked.text}
        </p>
        <p>
          <span className="text-muted-foreground">The direct answer: </span>
          {question.because}
        </p>
      </section>

      <section className="rounded-xl border border-dashed border-border px-4 py-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Flashcard habit</p>
        <h2 className="mt-1 font-serif text-xl">Repeat this question</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A flashcard app would show {concept.title} again. That works when the hole is this topic. It does not help when an earlier idea is missing.
        </p>
        <Link
          href={`/review/${concept.id}?from=${question.id}&choice=${choice}`}
          className={cn(buttonVariants({ variant: "outline" }), "mt-3")}
        >
          Restudy {concept.title}
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Earlier ideas</p>
          {mapFirst && rankerFirst ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {mapFirst === rankerFirst
                ? `The course map and the ranker agree. Start with ${rankerFirst}.`
                : `The course map would open with ${mapFirst}. The ranker opened with ${rankerFirst}, using the answer you picked as well as the map.`}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              This topic is at the start of the map, so there is no earlier idea to suggest.
            </p>
          )}
        </div>

        {suggestions.length === 0 ? null : (
          <ul className="flex flex-col gap-3">
            {suggestions.map((suggestion, index) => {
              const idea = getConcept(suggestion.conceptId)
              if (!idea) return null
              const wasRejected = rejected.has(suggestion.conceptId)
              return (
                <li key={suggestion.conceptId} className="rounded-xl border border-border bg-card px-4 py-4">
                  <p className="text-xs text-muted-foreground">Suggestion {index + 1}</p>
                  <h2 className="font-serif text-xl">{idea.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{idea.summary}</p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm leading-relaxed">
                    {suggestion.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/review/${idea.id}?from=${question.id}&choice=${choice}`}
                      className={buttonVariants()}
                    >
                      Review {idea.title}
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={wasRejected}
                      onClick={() => reject(suggestion.conceptId)}
                    >
                      {wasRejected ? "Marked as the wrong hole" : "This isn't the hole"}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      </section>
    </div>
  )
}
