import { Suspense } from "react";
import { ReviewView } from "@/components/review-view";

export default async function Page({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading the note…</p>}>
      <ReviewView conceptId={conceptId} />
    </Suspense>
  );
}
