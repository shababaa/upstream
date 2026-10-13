import { Badge } from "@/components/ui/badge"
import type { Status } from "@/lib/progress"

export function StatusPill({ status }: { status: Status | "loading" }) {
  if (status === "loading") return <Badge variant="outline">Checking</Badge>
  if (status === "solid") return <Badge>Solid</Badge>
  if (status === "shaky") return <Badge variant="destructive">Shaky</Badge>
  return <Badge variant="outline">Not started</Badge>
}
