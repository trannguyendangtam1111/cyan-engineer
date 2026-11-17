import { Github } from "lucide-react"
import { isExternal, site } from "@/lib/site"
import { HeroProjects } from "@/components/illustrations"

const button =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] px-5 " +
  "text-[15px] font-semibold leading-none tracking-[-0.01em]"

export function Hero() {
  const { cv, github } = site.links
  const githubExternal = github !== null && isExternal(github)

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex items-center justify-between gap-10"
    >
      {/* Soft cyan glow behind the intro — decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -inset-y-10 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 75% at 20% 50%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 72%)",
        }}
      />

      <div className="min-w-0 max-w-[640px]">
        {/* Technology label */}
        <p className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase leading-none tracking-[0.12em] text-accent-ink">
          <span aria-hidden="true" className="block h-1.5 w-4 rounded-full bg-accent" />
          Java · Spring Boot · PostgreSQL
        </p>

        {/* Name — heaviest element on the page */}
        <h1
          id="hero-heading"
          className="text-fg-strong font-bold text-balance leading-[1.05] tracking-[-0.035em]"
          style={{ fontSize: "clamp(38px, 5vw, 56px)" }}
        >
          Hi, I&apos;m {site.name}.
        </h1>

        {/* Role — reads immediately after the name */}
        <p
          className="text-fg mt-3 font-semibold leading-[1.25] tracking-[-0.02em]"
          style={{ fontSize: "clamp(19px, 2vw, 23px)" }}
        >
          {site.role}
        </p>

        {/* Pitch — the domain, in one sentence */}
        <p className="mt-2 text-[15px] leading-[1.6] text-fg-muted text-pretty sm:text-[16px]">
          {site.pitch}
        </p>

        {/* Calls to action + availability */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {cv === null ? (
            /* No CV yet: clearly unavailable, not a link and not focusable */
            <span
              className={`${button} cursor-not-allowed border border-dashed border-cv-border text-fg-muted`}
            >
              View CV
              <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium leading-[1.5] text-fg-muted">
                Soon
              </span>
              <span className="sr-only"> (not available yet)</span>
            </span>
          ) : (
            <a
              href={cv}
              className={`${button} bg-accent text-accent-on transition-colors duration-100 hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline-none focus-visible:ring-focus`}
            >
              View CV <span aria-hidden="true">→</span>
            </a>
          )}

          {github !== null && (
            <a
              href={github}
              {...(githubExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`${button} border border-line bg-surface text-fg-strong transition-colors duration-100 hover:border-line-hover hover:text-accent-ink focus-visible:outline-none focus-visible:ring-focus`}
            >
              <Github aria-hidden="true" size={16} strokeWidth={2} />
              GitHub
              <span aria-hidden="true" className="text-fg-subtle">↗</span>
              {githubExternal && <span className="sr-only"> (opens in new tab)</span>}
            </a>
          )}

          {/* Availability — informational, not interactive */}
          <p
            className="
              inline-flex items-center gap-2 rounded-full
              border border-line bg-mint px-3 py-1.5
              text-[13px] font-medium leading-[1.4] text-fg
            "
          >
            <span
              aria-hidden="true"
              className="block h-2 w-2 flex-shrink-0 rounded-full bg-mint-ink"
            />
            {site.availability}
          </p>
        </div>
      </div>

      <HeroProjects className="hidden h-auto flex-shrink-0 lg:block lg:w-[264px] xl:w-[300px]" />
    </section>
  )
}
