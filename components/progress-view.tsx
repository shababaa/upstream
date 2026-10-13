"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUpstream } from "@/components/use-upstream"
import { getQuestion } from "@/lib/course/catalog"
import { percent } from "@/lib/display"
import { evaluation } from "@/lib/ml/model"
import { conceptTitle, counts, resetProgress } from "@/lib/progress"

export function ProgressView() {
  const { store, ready } = useUpstream()
  const tally = counts(ready ? store : { attempts: [], feedback: [] })
  const recent = [...store.attempts].slice(-8).reverse()
  const nudges = store.feedback.length

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight">Progress</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Your checks stay in this browser. The comparison below is from simulated students, so there is something to read before you answer anything.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Solid topics" value={ready ? String(tally.solid) : "…"} />
        <Stat label="Shaky topics" value={ready ? String(tally.shaky) : "…"} />
        <Stat label="Ranker updates" value={ready ? String(nudges) : "…"} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-xl">Your recent checks</h2>
        {!ready ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No checks yet.{" "}
            <Link href="/" className="underline decoration-border underline-offset-2 hover:text-foreground">
              Start with a topic
            </Link>
            , or open the sample miss on the how-to page.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {recent.map((attempt, index) => {
              const question = getQuestion(attempt.questionId)
              return (
                <li key={`${attempt.questionId}-${attempt.at}-${index}`} className="px-4 py-3 text-sm">
                  <p className="font-medium">
                    {conceptTitle(attempt.conceptId)}{" "}
                    <span className="font-normal text-muted-foreground">{attempt.correct ? "right" : "missed"}</span>
                  </p>
                  {question ? <p className="mt-1 text-muted-foreground">{question.prompt}</p> : null}
                </li>
              )
            })}
          </ul>
        )}
        {nudges > 0 ? (
          <p className="text-sm text-muted-foreground">
            {nudges} {nudges === 1 ? "update is" : "updates are"} applied on top of the starter ranker: rejections pull it away, and a retry that goes right pulls it toward that idea.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Rejections and retries will nudge the starter ranker. Until then, suggestions use the model trained on simulated students.
          </p>
        )}
        <Button type="button" variant="outline" className="self-start" onClick={() => resetProgress()}>
          Clear answers in this browser
        </Button>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-xl">Does the ranker beat the map?</h2>
        <p className="text-sm leading-relaxed">
          Imaginary students each have a known hole. They miss a later question in the way that hole would cause. A method scores a hit when the hole is in its top 3. The far misses below were not used to train the ranker. {evaluation.trainedOn} other misses were.
        </p>
        <MetricBlock
          title={`Hole is three or more steps back · ${evaluation.far.episodes} held-out misses`}
          rows={[
            ["Ranker", evaluation.far.ranker],
            ["Wording of the wrong answer", evaluation.far.text],
            ["Course map", evaluation.far.map],
            ["Repeat the missed topic", evaluation.far.restudy],
          ]}
          note="On these misses the ranker and a wording-only rule both find the hole, and the map does not. The ranker learned to trust the words in the wrong answer. The map never looks at which answer you picked, so it keeps suggesting the nearest earlier topic."
        />
        <MetricBlock
          title={`Hole is the topic itself · ${evaluation.self.episodes} held-out misses`}
          rows={[
            ["Ranker", evaluation.self.ranker],
            ["Repeat the missed topic", evaluation.self.restudy],
            ["Wording of the wrong answer", evaluation.self.text],
            ["Course map", evaluation.self.map],
          ]}
          note="Here, repeating the topic is the right habit. Wording alone gets pulled toward whatever the wrong answer happened to mention. The ranker, trained on both kinds of miss, still keeps the topic itself in its top 3."
        />
        <p className="text-sm text-muted-foreground">
          The simulated wrong answers use words from the missing idea&apos;s note. That is a stand-in for a student who missed because of that idea, not a claim about every possible wrong answer.{" "}
          <Link href="/how" className="underline decoration-border underline-offset-2 hover:text-foreground">
            How the pieces fit
          </Link>
        </p>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="font-serif text-2xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function MetricBlock({
  title,
  rows,
  note,
}: {
  title: string
  rows: [string, number][]
  note: string
}) {
  return (
    <div className="rounded-xl border border-border px-4 py-4">
      <h3 className="font-medium">{title}</h3>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-t border-border">
              <td className="py-1.5 pr-3">{label}</td>
              <td className="py-1.5 text-right font-medium tabular-nums">{percent(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{note}</p>
    </div>
  )
}
