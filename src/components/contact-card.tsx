import { Linkedin, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { site } from "@/lib/site"

interface ContactCardProps {
  className?: string
}

const action =
  "inline-flex min-h-[44px] min-w-0 items-center gap-2 rounded-[12px] px-4 " +
  "border border-line bg-surface-sunken text-[14px] font-medium text-fg-strong " +
  "transition-colors duration-100 hover:border-line-hover hover:text-accent-ink " +
  "focus-visible:outline-none focus-visible:ring-focus"

/*
 * Secondary-tier card (not a link itself): shows the real address so it can
 * be read or copied, plus one action per contact channel in site.ts.
 * Hidden when no channel is available.
 */
export function ContactCard({ className }: ContactCardProps) {
  const { email, linkedin } = site.links
  if (email === null && linkedin === null) return null

  /* Allow a line break only before the "@" on narrow cards */
  const [local, domain] = (email?.replace(/^mailto:/, "") ?? "").split("@")

  return (
    <article
      aria-labelledby="contact-heading"
      className={cn(
        "flex flex-col gap-5 rounded-[20px] sm:rounded-[24px]",
        "border border-line bg-surface p-5 shadow-card-sm sm:p-6",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface-sunken text-fg-muted"
      >
        <Mail size={16} strokeWidth={1.75} />
      </span>

      <div>
        <h2
          id="contact-heading"
          className="text-fg-strong text-[16px] font-semibold leading-[1.3] tracking-[-0.01em]"
        >
          Contact
        </h2>
        <p className="mt-1 text-[14px] leading-[1.5] text-fg-muted text-pretty">
          About backend work, systems, or to talk shop.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {email !== null && (
            <a href={email} className={action}>
              <Mail aria-hidden="true" size={15} strokeWidth={2} className="flex-shrink-0" />
              <span className="min-w-0">
                {local}
                <wbr />@{domain}
              </span>
            </a>
          )}
          {linkedin !== null && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={action}
            >
              <Linkedin aria-hidden="true" size={15} strokeWidth={2} className="flex-shrink-0" />
              LinkedIn
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
