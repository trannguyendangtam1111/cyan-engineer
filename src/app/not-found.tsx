import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

/* TopBar and Footer come from the root layout, so the 404 keeps site navigation and theme. */
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist.",
  // No canonical; Next.js adds `noindex` to 404 responses itself.
  alternates: { canonical: null },
}

const button =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] px-5 " +
  "text-[15px] font-semibold leading-none tracking-[-0.01em] transition-colors duration-100 " +
  "focus-visible:outline-none focus-visible:ring-focus"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12"
    >
      <div className="my-16 max-w-[560px] sm:my-24 lg:my-28">
        <p className="stack-tag w-fit font-semibold text-accent-ink">404</p>
        <h1
          className="mt-5 text-fg-strong font-bold leading-[1.05] tracking-[-0.035em]"
          style={{ fontSize: "clamp(34px, 4.5vw, 48px)" }}
        >
          Page not found
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-fg-muted text-pretty sm:text-[16px]">
          The page you’re looking for doesn’t exist or has moved. Try the homepage or the projects
          list instead.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className={cn(button, "bg-accent text-accent-on hover:bg-accent-hover active:bg-accent-pressed")}
          >
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
            Back to home
          </Link>
          <Link
            href="/projects"
            className={cn(
              button,
              "border border-line bg-surface text-fg-strong hover:border-line-hover hover:text-accent-ink"
            )}
          >
            View projects
          </Link>
        </div>
      </div>
    </main>
  )
}
