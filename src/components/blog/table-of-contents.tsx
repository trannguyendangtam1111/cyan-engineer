"use client"

import { useEffect, useState } from "react"
import type { PostHeading } from "@/lib/blog"

/*
 * Table of contents from the post's h2/h3 headings (ids set in lib/blog.ts).
 * Plain in-page links, so it works without JavaScript; with it, the desktop
 * variant marks the section being read (aria-current="location").
 */

const linkBase = `
  block rounded-[6px] py-1.5 text-[14px] leading-[1.4] text-pretty transition-colors duration-100
  hover:text-accent-ink focus-visible:outline-none focus-visible:ring-focus
`

function TocList({ headings, activeId }: { headings: PostHeading[]; activeId?: string | null }) {
  return (
    <ol role="list" className="space-y-0.5">
      {headings.map((h) => {
        const active = h.id === activeId
        return (
          <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
            <a
              href={`#${h.id}`}
              aria-current={active ? "location" : undefined}
              className={`${linkBase} -ml-px border-l pl-3 ${active ? "border-accent-ink font-semibold text-fg-strong" : "border-transparent text-fg-muted"}`}
            >
              {h.text}
            </a>
          </li>
        )
      })}
    </ol>
  )
}

/** Desktop: sticky beside the reading column, with the current section marked. */
export function TableOfContents({ headings }: { headings: PostHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    // A handful of headings per post, so measuring on every scroll event is cheap;
    // React skips the re-render when the active id is unchanged.
    const update = () => {
      // The last heading that has scrolled past the top quarter of the viewport
      const line = window.innerHeight * 0.25
      let current: string | null = null
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id
        else break
      }
      // At the very end the last sections cannot reach that line: mark the last one shown
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      const last = elements[elements.length - 1]
      if (atBottom && last.getBoundingClientRect().top < window.innerHeight) current = last.id
      setActiveId(current)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [headings])

  return (
    <nav aria-labelledby="toc-heading" className="sticky top-8 max-h-[calc(100dvh-4rem)] overflow-y-auto pb-4">
      <h2 id="toc-heading" className="text-[12px] font-semibold uppercase leading-none tracking-[0.12em] text-fg-subtle">
        On this page
      </h2>
      <div className="mt-4 border-l border-line">
        <TocList headings={headings} activeId={activeId} />
      </div>
    </nav>
  )
}

/** Mobile/tablet: a collapsed disclosure above the article body. */
export function TableOfContentsCompact({ headings }: { headings: PostHeading[] }) {
  return (
    <details className="group/toc rounded-[12px] border border-line bg-surface-sunken">
      <summary
        className="
          flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 rounded-[12px] px-4
          text-[14px] font-semibold text-fg-strong
          focus-visible:outline-none focus-visible:ring-focus [&::-webkit-details-marker]:hidden
        "
      >
        <span>
          Contents <span className="font-medium text-fg-muted">· {headings.length} sections</span>
        </span>
        <span aria-hidden="true" className="text-fg-subtle transition-transform duration-150 group-open/toc:rotate-180">
          ▾
        </span>
      </summary>
      <nav aria-label="Table of contents" className="border-t border-line px-4 pb-3 pt-2">
        <div className="border-l border-line">
          <TocList headings={headings} />
        </div>
      </nav>
    </details>
  )
}
