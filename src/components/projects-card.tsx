import Image from "next/image"
import { Check, Gamepad2, Github, MapPin, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { isExternal, type Project } from "@/lib/site"
import { ComingSoon } from "@/components/coming-soon"

/* Presentation only — content and links live in site.ts */
const LOOK: Record<
  Project["id"],
  { icon: LucideIcon; tile: string; bar: string; check: string }
> = {
  foodmap: {
    icon: MapPin,
    tile: "bg-mint text-mint-ink",
    bar: "bg-mint-ink",
    check: "text-mint-ink",
  },
  cyanarcade: {
    icon: Gamepad2,
    tile: "bg-butter-soft text-butter-ink",
    bar: "bg-butter",
    check: "text-butter-ink",
  },
}

interface ProjectCardProps {
  project: Project
  className?: string
}

/*
 * Primary-tier card, one per project: screenshot in a minimal browser frame,
 * name + tagline, backend highlights, stack tags and the GitHub link.
 *
 * The <article> is not a link. The "View on GitHub" link stretches over the
 * whole card with an ::after overlay, so the card is clickable while the
 * link keeps a short accessible name. Its focus ring is drawn on the card.
 */
export function ProjectCard({ project, className }: ProjectCardProps) {
  const { id, name, tagline, stack, highlights, image, href } = project
  const look = LOOK[id]
  const Icon = look.icon
  const external = href !== null && isExternal(href)
  const titleId = `project-${id}-title`

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] sm:rounded-[24px]",
        "border border-line bg-surface shadow-card-sm",
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

      {/* Screenshot in a minimal browser frame */}
      <div className="px-4 pt-5 sm:px-5 sm:pt-6">
        <figure className="overflow-hidden rounded-[14px] border border-line bg-surface-sunken">
          <div
            aria-hidden="true"
            className="flex h-7 items-center gap-1.5 border-b border-line px-3"
          >
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
          </div>
          <div className="relative aspect-[16/10]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1200px) 520px, (min-width: 1024px) 45vw, (min-width: 640px) 90vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        </figure>
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
          <h2
            id={titleId}
            className="text-fg-strong text-[20px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[22px]"
          >
            {name}
          </h2>
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

        {/* Stack + destination, pinned to the bottom so both cards line up */}
        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-4">
            <ul role="list" aria-label="Tech stack" className="flex flex-wrap gap-1.5">
              {stack.map((tag) => (
                <li key={tag} className="stack-tag">
                  {tag}
                </li>
              ))}
            </ul>

            {href === null ? (
              <ComingSoon label="Link coming soon" />
            ) : (
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
      </div>
    </article>
  )
}
