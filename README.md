# Upstream

When you miss a check on a later Machine Learning Crash Course topic, the useful move is often to study an earlier idea. A flashcard app repeats the question you missed. Upstream names up to three earlier topics, and tells you why.

The notes are original summaries of the course path from linear regression through embeddings. They are not a copy of the course site. Production ML, AutoML, fairness, and large language models are left out of this prototype.

## Run it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

```bash
npm test
npm run lint
```

## How to use it

1. Open a topic and answer a check. Later topics rest on more earlier ideas, so a miss has somewhere to point.
2. On a miss, read both kinds of advice. “Repeat this question” is the flashcard habit. The cards under it are earlier ideas.
3. Review one idea, or press “This isn't the hole.” A rejection updates the ranker stored in this browser.
4. Retry a new question on the original topic. Progress shows whether that lined up.

The How to use page includes a sample miss, so you can see a recommendation without already knowing the material. Answers stay in `localStorage`. Nothing is uploaded.

## What the model is

Three pieces, all in the browser:

- A hand-built prerequisite map. This is the baseline.
- TF–IDF over the notes, then k-means, so similar wording forms groups. Those groups are separate from the map.
- A logistic regression ranker. Inputs include map distance, wording overlap with the question, wording overlap with the answer you picked, and a feature cross of “wording matches” and “this idea is upstream.”

Weights are fit on simulated students who miss later questions because a known earlier idea is missing. A held-out slice of far misses is scored against the map, against wording alone, and against “repeat the missed topic.” Your rejections and successful retries take one small step on the weights and are saved only in this browser.
