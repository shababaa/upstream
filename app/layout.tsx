import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { Shell } from "@/components/shell";
import "./globals.css";

const sans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const serif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Upstream",
  description:
    "When you miss a check in the Machine Learning Crash Course, study the earlier idea.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Suspense fallback={<p className="px-4 py-8 text-sm text-muted-foreground">Loading…</p>}>
          <Shell>{children}</Shell>
        </Suspense>
      </body>
    </html>
  );
}
