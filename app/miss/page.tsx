import { Suspense } from "react";
import { MissView } from "@/components/miss-view";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading the miss…</p>}>
      <MissView />
    </Suspense>
  );
}
