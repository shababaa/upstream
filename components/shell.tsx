"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

const links = [
  { href: "/", label: "Study" },
  { href: "/map", label: "Map" },
  { href: "/progress", label: "Progress" },
  { href: "/how", label: "How to use" },
]

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname()
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/" className="mr-2 leading-tight">
            <span className="font-serif text-lg text-foreground">Upstream</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => {
              const active = link.href === "/" ? path === "/" : path.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-sm",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <footer className="mx-auto w-full max-w-3xl px-4 pb-10 text-sm text-muted-foreground">
        Notes are original summaries of topics from{" "}
        <a
          className="underline decoration-border underline-offset-2 hover:text-foreground"
          href="https://developers.google.com/machine-learning/crash-course"
        >
          Google&apos;s Machine Learning Crash Course
        </a>
        . Answers stay in this browser.
      </footer>
    </>
  )
}
