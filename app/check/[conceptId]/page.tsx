import { CheckView } from "@/components/check-view";

export default async function Page({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  return <CheckView conceptId={conceptId} />;
}
