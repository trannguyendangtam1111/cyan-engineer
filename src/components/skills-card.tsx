import { Code2, Database, Server, Wrench, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { site, type SkillGroup } from "@/lib/site"

/* Presentation only — the skill lists live in site.ts */
const LOOK: Record<SkillGroup["id"], { icon: LucideIcon; tile: string }> = {
  languages: { icon: Code2, tile: "bg-accent text-accent-on" },
  backend: { icon: Server, tile: "bg-mint text-mint-ink" },
  database: { icon: Database, tile: "bg-lavender text-lavender-ink" },
  tools: { icon: Wrench, tile: "bg-butter-soft text-butter-ink" },
}

interface SkillsCardProps {
  className?: string
}

/*
 * Informational card (not a link): four colour-coded groups of the
 * technologies used across the showcased projects. No levels or ratings.
 */
export function SkillsCard({ className }: SkillsCardProps) {
  return (
    <article
      aria-labelledby="skills-heading"
      className={cn(
        "flex flex-col rounded-[20px] sm:rounded-[24px]",
        "border border-line bg-surface p-5 shadow-card-sm sm:p-7",
        className
      )}
    >
      <h2
        id="skills-heading"
        className="text-fg-strong text-[20px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[22px]"
      >
        Technical skills
      </h2>
      <p className="mt-1.5 text-[14px] leading-[1.5] text-fg-muted text-pretty">
        Technologies used in FoodMap and Cyan Arcade.
      </p>

      <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {site.skills.map(({ id, label, items }) => {
          const { icon: Icon, tile } = LOOK[id]
          return (
            <section key={id} aria-labelledby={`skills-${id}`}>
              <h3
                id={`skills-${id}`}
                className="flex items-center gap-2 text-[13px] font-semibold leading-none text-fg"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px]",
                    tile
                  )}
                >
                  <Icon size={13} strokeWidth={2.25} />
                </span>
                {label}
              </h3>
              <ul role="list" className="mt-2.5 flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className="stack-tag bg-surface-sunken px-2.5 text-[12px] text-fg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </article>
  )
}
