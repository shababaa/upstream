"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { StatusPill } from "@/components/status-pill"
import { useUpstream } from "@/components/use-upstream"
import { getConcept, listModules } from "@/lib/course/catalog"
import { clusterGroups } from "@/lib/ml/model"
import { statusOf } from "@/lib/progress"
import { cn } from "cn"

export function MapView() {
  const { store, ready } = useUpstream()
  const groups = clusterGroups()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight">Course map</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Arrows run backward: a topic rests on the ideas listed under it. The map was written by hand from the order of the Crash Course. The ranker can disagree with it when your wrong answer points somewhere farther back.
        </p>
      </div>

      {listModules().map(({ module, concepts }) => (
        <section key={module.id} className="flex flex-col gap-3">
          <h2 className="font-serif text-xl">{module.title}</h2>
          <ul className="flex flex-col gap-3">
            {concepts.map((concept) => {
              const rests = concept.prereqs
                .map((id) => getConcept(id))
                .filter((item): item is NonNullable<typeof item> => !!item)
              return (
                <li key={concept.id} className="rounded-xl border border-border bg-card px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{concept.title}</h3>
                    <StatusPill status={ready ? statusOf(store, concept.id) : "loading"} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{concept.summary}</p>
                  <p className="mt-2 text-sm">
                    {rests.length === 0 ? (
                      <span className="text-muted-foreground">Starting point. Nothing on the map comes before this.</span>
                    ) : (
                      <>
                        <span className="text-muted-foreground">Rests on </span>
                        {rests.map((item, index) => (
                          <span key={item.id}>
                            {index > 0 ? ", " : ""}
                            <Link href={`/review/${item.id}`} className="underline decoration-border underline-offset-2">
                              {item.title}
                            </Link>
                          </span>
                        ))}
                      </>
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/review/${concept.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                      Read
                    </Link>
                    <Link href={`/check/${concept.id}`} className={cn(buttonVariants({ size: "sm" }))}>
                      Check
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-xl">Groups from the wording</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          These groups are not the map. A clustering step reads the notes and puts similar wording together. The ranker uses “same group” as one of its inputs. A group is named after the note closest to the others in that group.
        </p>
        <ul className="flex flex-col gap-3">
          {groups.map((group) => {
            const medoid = getConcept(group.medoidId)
            return (
              <li key={group.id} className="rounded-xl border border-border px-4 py-3">
                <p className="text-sm font-medium">Near {medoid?.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {group.conceptIds.map((id) => getConcept(id)?.title).filter(Boolean).join(" · ")}
                </p>
              </li>
            )
          })}
        </ul>
        <p className="text-sm text-muted-foreground">
          Production ML, AutoML, fairness, and large language models are later Crash Course modules. They are not on this map yet.
        </p>
      </section>
    </div>
  )
}
