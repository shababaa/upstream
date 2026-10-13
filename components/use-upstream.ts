"use client"

import { useEffect, useSyncExternalStore } from "react"
import { replayWeights } from "@/lib/ml/model"
import {
  getSnapshot,
  hydrate,
  subscribe,
  getServerSnapshot,
} from "@/lib/progress"

export function useUpstream() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  useEffect(() => {
    hydrate()
  }, [])
  const weights = snap.ready ? replayWeights(snap.store.feedback) : null
  return { store: snap.store, ready: snap.ready, weights }
}
