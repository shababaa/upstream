import type { ReactNode } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { sampleMiss } from "@/lib/ml/model"
import { cn } from "cn"

export function HowTo() {
  const sample = sampleMiss()
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight">How to use Upstream</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Upstream is a study desk for the core of Google&apos;s Machine Learning Crash Course. A miss on a later topic often means an earlier idea never stuck. Repeating the hard question practices the symptom.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        <Step n="1" title="Take a check">
          Open a topic from Study or the Map. Pick the answer that matches the note, then press Check answer. Getting it right marks the topic solid. Getting it wrong opens the miss page. Later topics are better for seeing the map work, because they rest on more earlier ideas.
        </Step>
        <Step n="2" title="Read the miss page">
          You will see the answer you picked and a one-sentence direct answer. Under that, a dashed box offers the flashcard habit: restudy this topic. The cards below it are earlier ideas, at most three. Each card says why it was suggested, in a sentence, such as the wording of your answer or its place on the map.
        </Step>
        <Step n="3" title="Review or reject">
          Review opens the note, then a short check on that earlier idea, then a new question on the topic you missed. Reject, labeled “This isn&apos;t the hole,” tells the ranker this suggestion was wrong. You can reject and still review. Both are saved in this browser.
        </Step>
        <Step n="4" title="Look at Progress">
          Solid, shaky, and not started come from your latest check on each topic. The percentages on that page are not your score. They compare the ranker with three simpler rules on simulated students.
        </Step>
      </ol>

      <section className="rounded-xl border border-border bg-card px-4 py-4">
        <h2 className="font-serif text-xl">Try a sample miss</h2>
        <p className="mt-2 text-sm leading-relaxed">
          The sample is a real miss page for activation functions. The chosen wrong answer talks as if a stack of layers no longer needs a way to measure how wrong a prediction is. The course map wants to start at hidden layers, which is the nearest idea. The ranker should name Loss instead, because that is the earlier hole.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Opening it does not save anything. Reviewing or rejecting does, and you can clear that from Progress.
        </p>
        <Link
          href={`/miss?question=${sample.questionId}&choice=${sample.choice}`}
          className={cn(buttonVariants(), "mt-3")}
        >
          Open the sample miss
        </Link>
      </section>

      <section className="flex flex-col gap-3 text-sm leading-relaxed">
        <h2 className="font-serif text-xl">What is actually learning</h2>
        <p>
          Three pieces run before you answer anything. A hand-built map says which topics rest on which earlier topics. That map is the baseline, the way a careful reading of the course outline would work.
        </p>
        <p>
          The notes are turned into word weights (a small TF–IDF model) and then clustered, so topics with similar wording form groups. Clustering is separate from the map. You can see the groups at the bottom of the Map page.
        </p>
        <p>
          A logistic regression ranker then scores each candidate idea. Its inputs include whether the idea is earlier on the map, how close it is, whether the note&apos;s wording matches the question, whether it matches the answer you picked, and a feature cross of those last two: wording counts for more when the idea is also upstream. The weights were fit on simulated students. One slice of far misses was held out and is reported on Progress.
        </p>
        <p>
          Your rejections and successful retries take one small step on those weights, saved only in this browser. Clear answers on Progress to go back to the starter ranker.
        </p>
        <p className="text-muted-foreground">
          Nothing here calls a remote model. Refreshing the page keeps your checks. Another browser, or a cleared site storage, starts over.
        </p>
      </section>

      <section className="text-sm leading-relaxed">
        <h2 className="font-serif text-xl">What a status means</h2>
        <ul className="mt-2 flex flex-col gap-1">
          <li>
            <span className="font-medium">Not started.</span> You have not answered a check on that topic.
          </li>
          <li>
            <span className="font-medium">Shaky.</span> Your latest check on it was wrong.
          </li>
          <li>
            <span className="font-medium">Solid.</span> Your latest check on it was right. An earlier miss does not keep it shaky.
          </li>
        </ul>
      </section>

      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "self-start")}>
        Go study
      </Link>
    </div>
  )
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
        {n}
      </span>
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </li>
  )
}
