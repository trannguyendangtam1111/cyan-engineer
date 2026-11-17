import { Github, Linkedin, Mail } from "lucide-react"
import { site } from "@/lib/site"

/* Only destinations that exist in site.ts are shown */
const SOCIAL_LINKS = [
  { label: "GitHub profile (opens in new tab)", href: site.links.github, icon: Github, external: true },
  { label: "LinkedIn profile (opens in new tab)", href: site.links.linkedin, icon: Linkedin, external: true },
  { label: "Send an email", href: site.links.email, icon: Mail, external: false },
].filter((link): link is typeof link & { href: string } => link.href !== null)

export function Footer() {
  return (
    <footer className="w-full border-t border-line">
      <div
        className="
          mx-auto flex max-w-[1200px] flex-col items-center gap-3
          px-5 py-6 text-center
          sm:flex-row sm:justify-between sm:px-8 sm:py-5
          lg:px-12
        "
      >
        <p className="text-[13px] font-medium leading-[1.4] text-fg-muted">
          © {new Date().getFullYear()} {site.name} · {site.domain}
        </p>

        {SOCIAL_LINKS.length > 0 && (
          <nav aria-label="Secondary destinations">
            <ul className="flex items-center gap-2" role="list">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    aria-label={label}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="
                      flex h-10 w-10 items-center justify-center rounded-full
                      text-fg-muted transition-colors duration-100
                      hover:bg-surface hover:text-accent-ink
                      focus-visible:outline-none focus-visible:ring-focus
                    "
                  >
                    <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  )
}
