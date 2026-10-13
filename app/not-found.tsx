import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-serif text-2xl">That page is not part of the course map</h1>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to study
      </Link>
    </div>
  );
}
