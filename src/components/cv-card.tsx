import { cn } from "@/lib/utils"
import { site } from "@/lib/site"
import { CvGlyph } from "@/components/illustrations"

interface CVCardProps {
  className?: string
}

/*
 * Primary CTA card — the only card with a filled button.
 * Distinguished by a cyan-tinted surface and border, and the strongest hover lift.
 * Without a CV URL in site.ts it renders a non-interactive "coming soon" state.
 */
export function CVCard({ className }: CVCardProps) {
  const href = site.links.cv

  const base = cn(
    "flex min-h-[248px] flex-col rounded-[20px] sm:rounded-[24px]",
    "border border-cv-border bg-cv-surface p-6 sm:p-7 lg:p-8",
    className
  )

  const content = (
    <>
      <CvGlyph className="-ml-2 -mt-1" />

      <h2 className="text-fg-strong mt-4 text-[22px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[24px]">
        CV
      </h2>

      <p className="mt-2 text-[15px] leading-[1.55] text-fg-muted text-pretty">
        Backend roles and the systems I&apos;ve worked on.
      </p>

      {/* Push the action to the bottom */}
      <div className="min-h-6 flex-1" />

      {href === null ? (
        <span
          className="
            inline-flex min-h-[48px] w-full items-center justify-center
            rounded-[14px] border border-dashed border-cv-border px-5 py-3.5
            text-[15px] font-medium leading-none text-fg-muted
          "
        >
          CV coming soon
        </span>
      ) : (
        /* The only filled button on the page. A <span>: it lives inside the link. */
        <span
          className="
            inline-flex min-h-[48px] w-full items-center justify-center gap-1.5
            rounded-[14px] bg-accent px-5 py-3.5
            text-[15px] font-semibold leading-none tracking-[-0.01em] text-accent-on
            transition-colors duration-100
            group-hover:bg-accent-hover group-active:bg-accent-pressed
          "
        >
          View CV <span aria-hidden="true">→</span>
        </span>
      )}
    </>
  )

  if (href === null) {
    return <div className={base}>{content}</div>
  }

  return (
    <a
      href={href}
      className={cn(
        base,
        "group transition-[translate,border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
        "hover:border-cv-border-hover hover:shadow-card motion-safe:hover:-translate-y-[3px]",
        "focus-visible:outline-none focus-visible:ring-focus"
      )}
    >
      {content}
    </a>
  )
}
