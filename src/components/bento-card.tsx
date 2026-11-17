import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { isExternal } from "@/lib/site"

interface BentoCardProps {
  title: string
  /** Short highlighted line under the title, e.g. a handle. */
  meta?: string
  caption: string
  href: string
  icon: LucideIcon
  className?: string
}

/*
 * Secondary-tier link card (GitHub).
 * Quieter than Projects and CV: smaller type, neutral icon, smaller lift.
 */
export function BentoCard({ title, meta, caption, href, icon: Icon, className }: BentoCardProps) {
  const external = isExternal(href)

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group flex flex-col gap-5 rounded-[20px] sm:rounded-[24px]",
        "border border-line bg-surface p-5 shadow-card-sm sm:p-6",
        "transition-[translate,border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
        "hover:border-line-hover motion-safe:hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-focus",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className="
            flex h-9 w-9 items-center justify-center rounded-[10px]
            border border-line bg-surface-sunken text-fg-muted
            transition-colors duration-100 group-hover:text-accent-ink
          "
        >
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <span
          aria-hidden="true"
          className="text-[14px] text-fg-subtle transition-colors duration-100 group-hover:text-accent-ink"
        >
          {external ? "↗" : "→"}
        </span>
      </div>

      <div>
        <h2 className="text-fg-strong text-[16px] font-semibold leading-[1.3] tracking-[-0.01em]">
          {title}
        </h2>
        {meta && (
          <p className="mt-0.5 break-all text-[14px] font-medium leading-[1.5] text-accent-ink">
            {meta}
          </p>
        )}
        <p className="mt-1 text-[14px] leading-[1.5] text-fg-muted text-pretty">
          {caption}
          {external && <span className="sr-only"> (opens in new tab)</span>}
        </p>
      </div>
    </a>
  )
}
