import { cn } from "@/lib/utils"
import { site } from "@/lib/site"
import { CvGlyph } from "@/components/illustrations"

interface CVCardProps {
  className?: string
}

/*
 * Primary CTA card — the only card with a filled button.
 * Distinguished by a cyan-tinted surface and border, and the strongest hover lift.
 * The whole card links to the CV PDF, opened in a new tab. Hidden without a CV URL.
 */
export function CVCard({ className }: CVCardProps) {
  const href = site.links.cv
  if (href === null) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex flex-col rounded-[20px] sm:rounded-[24px]",
        "border border-cv-border bg-cv-surface p-6 sm:p-7",
        "transition-[translate,border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
        "hover:border-cv-border-hover hover:shadow-card motion-safe:hover:-translate-y-[3px]",
        "focus-visible:outline-none focus-visible:ring-focus",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <CvGlyph className="-my-1 -ml-2 flex-shrink-0" />
        <div>
          <h2 className="text-fg-strong text-[20px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[22px]">
            CV
          </h2>
          <p className="mt-0.5 text-[13px] font-medium leading-[1.4] text-fg-subtle">
            PDF · 1 page
          </p>
        </div>
      </div>

      <p className="mt-4 text-[15px] leading-[1.55] text-fg-muted text-pretty">
        Education, skills, and the backend projects behind this site.
      </p>

      {/* Pinned to the bottom when the grid row is taller than the content */}
      <div className="mt-auto pt-6">
        {/* The only filled button on the page. A <span>: it lives inside the link. */}
        <span
          className="
            inline-flex min-h-[48px] w-full items-center justify-center gap-1.5
            rounded-[14px] bg-accent px-5 py-3.5
            text-[15px] font-semibold leading-none tracking-[-0.01em] text-accent-on
            transition-colors duration-100
            group-hover:bg-accent-hover group-active:bg-accent-pressed
          "
        >
          View CV <span aria-hidden="true">↗</span>
        </span>
      </div>
      <span className="sr-only"> (PDF, opens in new tab)</span>
    </a>
  )
}
