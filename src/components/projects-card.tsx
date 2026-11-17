import Link from "next/link"
import { Check, Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { isExternal } from "@/lib/site"
import type { FeaturedProject } from "@/lib/projects"
import { ComingSoon } from "@/components/coming-soon"
import { BrowserFrame } from "@/components/project/browser-frame"
import { PROJECT_LOOK } from "@/components/project/project-look"
import { StackTags } from "@/components/project/stack-tags"

interface ProjectCardProps {
  project: FeaturedProject
  /** h2 on the homepage; h3 under a section heading on /projects. */
  headingLevel?: "h2" | "h3"
  className?: string
}

/*
 * Primary-tier card, one per project: screenshot in a minimal browser frame,
 * name + tagline, backend highlights, stack tags and links.
 *
 * The <article> is not a link. Its primary link (the case study, or GitHub
 * when there is no case study) stretches over the whole card with an ::after
 * overlay, and its focus ring is drawn on the card. A secondary GitHub link
 * sits above the overlay (relative z-10), so both work on their own — no
 * nested anchors, and the overlay never blocks the second link.
 */
export function ProjectCard({ project, headingLevel: Heading = "h2", className }: ProjectCardProps) {
  const { id, slug, name, tagline, stack, highlights, image, repository, detail } = project
  const look = PROJECT_LOOK[id]
  const Icon = look.icon
  const caseStudy = detail !== undefined ? `/projects/${slug}` : null
  const primary = caseStudy ?? repository
  const repoExternal = repository !== null && isExternal(repository)
  const titleId = `project-${id}-title`

  const githubLabel = (
    <>
      <Github aria-hidden="true" size={15} strokeWidth={2} />
      View on GitHub
      <span aria-hidden="true">↗</span>
      <span className="sr-only">
        : {name} repository{repoExternal ? " (opens in new tab)" : ""}
      </span>
    </>
  )
  const linkText = "inline-flex items-center gap-1.5 rounded-[8px] text-[14px] font-semibold"
  const stretched = "after:absolute after:inset-0 after:content-[''] focus-visible:shadow-none"

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] sm:rounded-[24px]",
        "border border-line bg-surface shadow-card-sm",
        primary !== null && [
          "transition-[translate,border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
          "hover:border-line-hover hover:shadow-card motion-safe:hover:-translate-y-0.5",
          "has-[[data-card-link]:focus-visible]:ring-focus",
        ],
        className
      )}
    >
      {/* Accent stripe */}
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-[3px]", look.bar)} />

      {/* Screenshot in a minimal browser frame */}
      <div className="px-4 pt-5 sm:px-5 sm:pt-6">
        <BrowserFrame
          src={image.src}
          alt={image.alt}
          priority
          sizes="(min-width: 1200px) 520px, (min-width: 768px) 45vw, (min-width: 640px) 90vw, 100vw"
        />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]",
              look.tile
            )}
          >
            <Icon size={17} strokeWidth={2} />
          </span>
          <Heading
            id={titleId}
            className="text-fg-strong text-[20px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[22px]"
          >
            {name}
          </Heading>
        </div>

        <p className="mt-3 text-[15px] leading-[1.55] text-fg-muted text-pretty">
          {tagline}
        </p>

        <ul role="list" className="mt-5 flex flex-col gap-2.5">
          {highlights.map((point) => (
            <li key={point} className="flex gap-2.5 text-[14px] leading-[1.5] text-fg">
              <Check
                aria-hidden="true"
                size={16}
                strokeWidth={2.25}
                className={cn("mt-[2px] flex-shrink-0", look.check)}
              />
              <span className="text-pretty">{point}</span>
            </li>
          ))}
        </ul>

        {/* Stack + destinations, pinned to the bottom so both cards line up */}
        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-4">
            <StackTags items={stack} />

            {primary === null ? (
              <ComingSoon label="Link coming soon" />
            ) : caseStudy !== null ? (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href={caseStudy}
                  data-card-link
                  className={cn(linkText, "text-accent-ink underline-offset-4 group-hover:underline", stretched)}
                >
                  View case study
                  <span aria-hidden="true">→</span>
                  <span className="sr-only">: {name}</span>
                </Link>
                {repository !== null && (
                  <a
                    href={repository}
                    {...(repoExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={cn(
                      linkText,
                      "relative z-10 text-fg-muted underline-offset-4 transition-colors duration-100",
                      "hover:text-accent-ink hover:underline"
                    )}
                  >
                    {githubLabel}
                  </a>
                )}
              </div>
            ) : (
              <a
                href={primary}
                data-card-link
                {...(repoExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={cn(linkText, "text-accent-ink underline-offset-4 group-hover:underline", stretched)}
              >
                {githubLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
