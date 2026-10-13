"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useUpstream } from "@/components/use-upstream"
import { getConcept, getQuestion } from "@/lib/course/catalog"
import { orderedChoices } from "@/lib/display"
import { conceptTitle, pickQuestion, recordAttempt, recordFeedback } from "@/lib/progress"
import { cn } from "cn"

export function ReviewView({ conceptId }: { conceptId: string }) {
  const concept = getConcept(conceptId)
  const params = useSearchParams()
  const router = useRouter()
  const fromId = params.get("from") ?? ""
  const fromChoice = Number(params.get("choice") ?? "-1")
  const fromQuestion = getQuestion(fromId)
  const linked = !!fromQuestion && Number.isInteger(fromChoice) && fromChoice > 0
  const restudy = linked && fromQuestion.conceptId === conceptId
  const { store, ready } = useUpstream()
  const [step, setStep] = useState<"read" | "check" | "retry" | "done">("read")
  const [checkRight, setCheckRight] = useState<boolean | null>(null)
  const [retryRight, setRetryRight] = useState<boolean | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [checkedId, setCheckedId] = useState<string | null>(null)
  const [checkChoice, setCheckChoice] = useState<number | null>(null)
  const [closing, setClosing] = useState("")

  if (!concept) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-2xl">That note is not on the map</h1>
        <Link href="/map" className={buttonVariants({ variant: "outline" })}>
          See the map
        </Link>
      </div>
    )
  }

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading your checks…</p>
  }

  const checkQuestion = pickQuestion(store, concept.id, restudy ? fromId : undefined)
  const retryQuestion =
    linked && fromQuestion && !restudy
      ? pickQuestion(store, fromQuestion.conceptId, fromQuestion.id)
      : undefined
  const active = step === "retry" ? retryQuestion : checkQuestion

  function answerCheck() {
    if (!checkQuestion || picked === null) return
    const right = picked === 0
    const answeredId = checkQuestion.id
    const answeredChoice = picked
    recordAttempt({
      questionId: answeredId,
      conceptId: concept!.id,
      correct: right,
      choice: answeredChoice,
    })
    setCheckedId(answeredId)
    setCheckChoice(answeredChoice)
    setCheckRight(right)
    setPicked(null)
    if (restudy && fromQuestion) {
      recordFeedback({
        questionId: fromQuestion.id,
        choice: fromChoice,
        candidateId: concept!.id,
        y: right ? 1 : 0,
      })
      setRetryRight(right)
      setClosing(checkQuestion.because)
      setStep("done")
      return
    }
    if (!linked || !retryQuestion) {
      setClosing(checkQuestion.because)
      setStep("done")
      return
    }
    setStep("retry")
  }

  function answerRetry() {
    if (!retryQuestion || !fromQuestion || picked === null) return
    const right = picked === 0
    recordAttempt({
      questionId: retryQuestion.id,
      conceptId: fromQuestion.conceptId,
      correct: right,
      choice: picked,
    })
    recordFeedback({
      questionId: fromQuestion.id,
      choice: fromChoice,
      candidateId: concept!.id,
      y: right ? 1 : 0,
    })
    setRetryRight(right)
    setClosing(retryQuestion.because)
    setStep("done")
  }

  const stepLabel = !linked
    ? "Reading"
    : restudy
      ? step === "read"
        ? "Step 1 of 2 · Read"
        : "Step 2 of 2 · Check"
      : step === "read"
        ? "Step 1 of 3 · Read"
        : step === "check"
          ? "Step 2 of 3 · Check the earlier idea"
          : step === "retry"
            ? "Step 3 of 3 · Retry the original topic"
            : "Done"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{stepLabel}</p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight">{concept.title}</h1>
        {linked && fromQuestion && !restudy && step !== "done" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            You came here from a miss on {conceptTitle(fromQuestion.conceptId)}. After this note, you will retry that topic with a different question.
          </p>
        ) : null}
        {restudy ? (
          <p className="mt-2 text-sm text-muted-foreground">
            This is the flashcard path: restudy the topic you missed, then answer a different question on it.
          </p>
        ) : null}
      </div>

      {step === "read" ? (
        <article className="flex flex-col gap-3">
          {concept.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed">
              {paragraph}
            </p>
          ))}
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">{concept.hold}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setStep("check")}>
              I&apos;ve read this. Check me.
            </Button>
            <Link href="/map" className={buttonVariants({ variant: "outline" })}>
              Back to the map
            </Link>
          </div>
        </article>
      ) : null}

      {step === "check" && checkQuestion ? (
        <QuestionBlock
          prompt={checkQuestion.prompt}
          questionId={checkQuestion.id}
          picked={picked}
          onPick={setPicked}
          onSubmit={answerCheck}
          submitLabel="Check this idea"
        />
      ) : null}

      {step === "retry" && retryQuestion && fromQuestion ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed">
            {checkRight
              ? `${concept.title} looks solid on that check. Now a new question on ${conceptTitle(fromQuestion.conceptId)}.`
              : `${concept.title} is still shaky. You can look under it, or retry ${conceptTitle(fromQuestion.conceptId)} anyway.`}
          </p>
          {checkRight === false && checkQuestion ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => { setStep("read"); setCheckRight(null) }}>
                Read the note again
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!checkedId || !checkChoice}
                onClick={() => {
                  if (!checkedId || !checkChoice) return
                  router.push(`/miss?question=${checkedId}&choice=${checkChoice}`)
                }}
              >
                See what sits under this
              </Button>
            </div>
          ) : null}
          <QuestionBlock
            prompt={retryQuestion.prompt}
            questionId={retryQuestion.id}
            picked={picked}
            onPick={setPicked}
            onSubmit={answerRetry}
            submitLabel={`Retry ${conceptTitle(fromQuestion.conceptId)}`}
          />
        </div>
      ) : null}

      {step === "done" ? (
        <section className="rounded-xl border border-border bg-card px-4 py-4">
          <h2 className="font-serif text-xl">
            {retryRight ? "That lined up" : linked ? "Still missing" : checkRight ? "That's the idea" : "Still shaky"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            {linked && retryRight
              ? `Reviewing ${concept.title} lined up with getting the next question right. The ranker treats that as a useful suggestion.`
              : linked
                ? `The next question still missed. The ranker will lean away from ${concept.title} for this kind of miss.`
                : checkRight
                  ? concept.hold
                  : `${concept.title} is still shaky. Read it once more, or open the map and check an idea it rests on.`}
          </p>
          {closing ? <p className="mt-2 text-sm text-muted-foreground">{closing}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/" className={buttonVariants()}>
              Back to study
            </Link>
            <Link href="/progress" className={buttonVariants({ variant: "outline" })}>
              See progress
            </Link>
            {linked && fromQuestion ? (
              <Link href={`/check/${fromQuestion.conceptId}`} className={buttonVariants({ variant: "outline" })}>
                Another check on {conceptTitle(fromQuestion.conceptId)}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {step !== "read" && step !== "done" && !active ? (
        <p className="text-sm text-muted-foreground">This topic has no check to give.</p>
      ) : null}
    </div>
  )
}

function QuestionBlock({
  prompt,
  questionId,
  picked,
  onPick,
  onSubmit,
  submitLabel,
}: {
  prompt: string
  questionId: string
  picked: number | null
  onPick: (index: number) => void
  onSubmit: () => void
  submitLabel: string
}) {
  const question = getQuestion(questionId)
  if (!question) return null
  const choices = orderedChoices(question)
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-xl leading-snug">{prompt}</h2>
      <div className="flex flex-col gap-2">
        {choices.map((choice) => {
          const selected = picked === choice.originalIndex
          return (
            <Button
              key={choice.originalIndex}
              type="button"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={() => onPick(choice.originalIndex)}
              className="h-auto w-full justify-start whitespace-normal px-3 py-3 text-left text-sm leading-snug"
            >
              {choice.text}
            </Button>
          )
        })}
      </div>
      <Button type="button" disabled={picked === null} onClick={onSubmit} className={cn("h-10 self-start px-4")}>
        {submitLabel}
      </Button>
    </section>
  )
}
