import { Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { isExternal } from "@/lib/site"
import type { Project } from "@/lib/projects"
import { PROJECT_LOOK } from "@/components/project/project-look"
import { StackTags } from "@/components/project/stack-tags"
import { StatusBadge } from "@/components/project/status-badge"

interface ProjectListCardProps {
  project: Project
  className?: string
}

/*
 * Compact card for /projects → Other projects: no screenshot or highlights.
 * Same stretched-link pattern as ProjectCard: the repository link covers the
 * card, and its focus ring is drawn on the card.
 */
export function ProjectListCard({ project, className }: ProjectListCardProps) {
  const { id, name, tagline, stack, status, repository: href } = project
  const look = PROJECT_LOOK[id]
  const Icon = look.icon
  const external = href !== null && isExternal(href)
  const titleId = `project-${id}-title`

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] sm:rounded-[24px]",
        "border border-line bg-surface p-5 shadow-card-sm sm:p-6",
        href !== null && [
          "transition-[translate,border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
          "hover:border-line-hover hover:shadow-card motion-safe:hover:-translate-y-0.5",
          "has-[a:focus-visible]:ring-focus",
        ],
        className
      )}
    >
      {/* Accent stripe */}
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-[3px]", look.bar)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]",
              look.tile
            )}
          >
            <Icon size={17} strokeWidth={2} />
          </span>
          <h3
            id={titleId}
            className="text-fg-strong text-[18px] font-bold leading-[1.25] tracking-[-0.02em]"
          >
            {name}
          </h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="mt-3 text-[14px] leading-[1.55] text-fg-muted text-pretty">{tagline}</p>

      <div className="mt-auto pt-5">
        <div className="flex flex-col items-start gap-4 border-t border-line pt-4">
          <StackTags items={stack} />

          {href !== null && (
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="
                inline-flex items-center gap-1.5 rounded-[8px]
                text-[14px] font-semibold text-accent-ink
                underline-offset-4 group-hover:underline
                after:absolute after:inset-0 after:content-['']
                focus-visible:shadow-none
              "
            >
              <Github aria-hidden="true" size={15} strokeWidth={2} />
              View on GitHub
              <span aria-hidden="true">↗</span>
              <span className="sr-only">
                : {name} repository{external ? " (opens in new tab)" : ""}
              </span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
