"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { StatusPill } from "@/components/status-pill"
import { useUpstream } from "@/components/use-upstream"
import { listModules } from "@/lib/course/catalog"
import { questions } from "@/lib/course/questions"
import { concepts } from "@/lib/course/concepts"
import { continueConcept, counts, statusOf } from "@/lib/progress"
import { cn } from "cn"

export function StudyDesk() {
  const { store, ready } = useUpstream()
  const next = continueConcept(store)
  const tally = counts(ready ? store : { attempts: [], feedback: [] })
  const nextStatus = ready ? statusOf(store, next.id) : "new"
  const verb = nextStatus === "shaky" ? "Repair" : "Continue with"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl tracking-tight">Study the earlier idea</h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          When a check goes wrong, Upstream names up to three earlier topics instead of only handing you the same question again.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card px-4 py-4">
        <h2 className="font-serif text-lg">How to use this</h2>
        <ol className="mt-3 flex flex-col gap-2 text-sm leading-relaxed">
          <li>
            <span className="font-medium">1. Take a check.</span> Open a topic below. Later topics depend on earlier ones, so a miss has somewhere to point.
          </li>
          <li>
            <span className="font-medium">2. Read both kinds of advice.</span> “Repeat this question” is the flashcard habit. The three cards under it are earlier ideas.
          </li>
          <li>
            <span className="font-medium">3. Review one, or reject it.</span> “This isn&apos;t the hole” teaches the ranker. That update stays in this browser.
          </li>
          <li>
            <span className="font-medium">4. Retry a new question</span> on the original topic. Upstream records whether the earlier review lined up with getting it right.
          </li>
        </ol>
        <p className="mt-3 text-sm text-muted-foreground">
          <Link href="/how" className="underline decoration-border underline-offset-2 hover:text-foreground">
            Full instructions, including a sample miss
          </Link>
          . {concepts.length} topics and {questions.length} checks, following the Crash Course path through embeddings.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/check/${next.id}`} className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
          {verb} {next.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {ready ? `${tally.solid} solid · ${tally.shaky} shaky · ${tally.fresh} not started` : "Loading your checks…"}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {listModules().map(({ module, concepts: moduleConcepts }) => (
          <section key={module.id} className="flex flex-col gap-2">
            <div>
              <h2 className="font-serif text-xl">{module.title}</h2>
              <p className="text-sm text-muted-foreground">Crash Course module: {module.courseName}</p>
            </div>
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
              {moduleConcepts.map((concept) => (
                <li key={concept.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/check/${concept.id}`} className="font-medium hover:underline">
                        {concept.title}
                      </Link>
                      <StatusPill status={ready ? statusOf(store, concept.id) : "loading"} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{concept.summary}</p>
                  </div>
                  <Link
                    href={`/check/${concept.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 self-start")}
                  >
                    Check
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
