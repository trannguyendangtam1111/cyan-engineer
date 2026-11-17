import { FileText, Gamepad2, MapPin, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { isExternal, site, type Project } from "@/lib/site"
import { ComingSoon } from "@/components/coming-soon"

/* Presentation only — content and links live in site.ts */
const LOOK: Record<Project["id"], { icon: LucideIcon; tile: string }> = {
  foodmap: { icon: MapPin, tile: "bg-mint text-mint-ink" },
  kairo: { icon: FileText, tile: "bg-lavender text-lavender-ink" },
  gamehub: { icon: Gamepad2, tile: "bg-butter-soft text-butter-ink" },
}

function ProjectRow({ id, name, tagline, stack, href }: Project) {
  const { icon: Icon, tile } = LOOK[id]
  const external = href !== null && isExternal(href)

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px]",
          tile
        )}
      >
        <Icon size={18} strokeWidth={2} />
      </span>

      <div className="min-w-0">
        <h3 className="text-fg-strong text-[17px] font-semibold leading-[1.25] tracking-[-0.02em] sm:text-[18px]">
          {name}
        </h3>
        <p className="mt-1 text-[14px] leading-[1.5] text-fg-muted text-pretty">
          {tagline}
        </p>
      </div>

      {/* Stack + destination: under the text on mobile, right column on sm+ */}
      <div className="col-start-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:col-start-3 sm:flex-col sm:items-end sm:justify-center">
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {stack.map((tag) => (
            <span key={tag} className="stack-tag">
              {tag}
            </span>
          ))}
        </div>
        {href === null ? (
          <ComingSoon label="Link coming soon" />
        ) : (
          <span className="text-[13px] font-medium text-fg-muted transition-colors duration-100 group-hover/row:text-accent-ink">
            Source <span aria-hidden="true">{external ? "↗" : "→"}</span>
            {external && <span className="sr-only"> (opens in new tab)</span>}
          </span>
        )}
      </div>
    </>
  )

  const base = cn(
    "grid grid-cols-[40px_minmax(0,1fr)] items-start gap-x-4 gap-y-3",
    "sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-center",
    "rounded-[18px] border border-line bg-surface-sunken p-4"
  )

  if (href === null) {
    return <li className={base}>{content}</li>
  }

  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={cn(
          base,
          "group/row transition-[translate,border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
          "hover:border-line-hover hover:shadow-card motion-safe:hover:-translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-focus"
        )}
      >
        {content}
      </a>
    </li>
  )
}

interface ProjectsCardProps {
  className?: string
}

/*
 * Primary-tier card. The outer <article> is not a link; each project row is
 * its own link when it has a destination.
 */
export function ProjectsCard({ className }: ProjectsCardProps) {
  return (
    <article
      aria-labelledby="projects-heading"
      className={cn(
        "flex flex-col gap-5 rounded-[20px] sm:rounded-[24px]",
        "border border-line bg-surface p-5 shadow-card-sm sm:p-7 lg:p-8",
        className
      )}
    >
      <h2
        id="projects-heading"
        className="text-fg-strong text-[22px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[24px]"
      >
        Projects
      </h2>

      <ul role="list" className="flex flex-1 flex-col gap-3">
        {site.projects.map((project) => (
          <ProjectRow key={project.id} {...project} />
        ))}
      </ul>
    </article>
  )
}
