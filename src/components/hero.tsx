import { site } from "@/lib/site"
import { HeroProjects } from "@/components/illustrations"

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="flex items-center justify-between gap-10"
    >
      <div className="max-w-[640px]">
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

        {/* Availability — informational, not interactive */}
        <p
          className="
            mt-6 inline-flex items-center gap-2 rounded-full
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

      <HeroProjects className="hidden flex-shrink-0 lg:block" />
    </section>
  )
}
