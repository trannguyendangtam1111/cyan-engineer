import { site } from "@/lib/site"
import { NavLink } from "@/components/nav-link"
import { ThemeToggle } from "@/components/theme-toggle"

/* Main sections. Set `published: false` to hide an entry whose route does not exist yet. */
const NAV_ITEMS = [
  { href: "/", label: "Home", published: true },
  { href: "/projects", label: "Projects", published: true },
  { href: "/blog", label: "Blog", published: true },
] as const

export function TopBar() {
  return (
    <header className="w-full">
      <div
        className="
          mx-auto flex h-16 max-w-[1200px] items-center
          justify-between px-5 sm:h-20 sm:px-8 lg:px-12
        "
      >
        {/* Logo / wordmark */}
        <a
          href="/"
          aria-label={`${site.domain} — home`}
          className="
            group -m-1 flex items-center gap-2.5 rounded-[10px] p-1 text-fg-strong
            focus-visible:outline-none focus-visible:ring-focus
          "
        >
          {/* Geometric mark — two stacked layers (backend stack metaphor) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect width="24" height="24" rx="7" fill="var(--accent)" />
            <rect x="6" y="7" width="12" height="4" rx="2" fill="var(--accent-on)" />
            <rect x="6" y="13" width="8" height="4" rx="2" fill="var(--accent-on)" opacity="0.5" />
          </svg>
          {/* Below sm only the mark shows, so three links fit; the link keeps its aria-label */}
          <span className="text-[15px] font-semibold tracking-tight transition-colors duration-100 group-hover:text-accent-ink max-sm:hidden">
            {site.domain}
          </span>
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Site">
            <ul role="list" className="flex items-center gap-0.5 sm:gap-1">
              {NAV_ITEMS.filter((item) => item.published).map(({ href, label }) => (
                <li key={href}>
                  <NavLink href={href}>{label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
