import Link from "next/link"

interface BreadcrumbProps {
  /** Ancestors first; the current page is `current`. */
  trail: { href: string; label: string }[]
  current: string
}

export function Breadcrumb({ trail, current }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[13px] font-medium leading-none text-fg-muted">
        {trail.map(({ href, label }) => (
          <li key={href} className="flex items-center gap-2">
            <Link
              href={href}
              className="
                -m-1 rounded-[6px] p-1 transition-colors duration-100
                hover:text-accent-ink focus-visible:outline-none focus-visible:ring-focus
              "
            >
              {label}
            </Link>
            <span aria-hidden="true" className="text-fg-subtle">
              /
            </span>
          </li>
        ))}
        <li aria-current="page" className="text-fg">
          {current}
        </li>
      </ol>
    </nav>
  )
}
