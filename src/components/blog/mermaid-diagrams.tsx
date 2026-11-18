"use client"

import { useEffect } from "react"

/*
 * Renders the post's ```mermaid figures (see lib/blog.ts) to SVG in the browser.
 *
 * - Mounted only on posts that have diagrams; Mermaid itself is a dynamic
 *   import, so it is a separate chunk that other pages never download.
 * - securityLevel "strict": Mermaid sanitises labels and disables click
 *   handlers and scripts in diagram sources.
 * - Colours come from the site's theme tokens and are re-applied when the
 *   theme changes. Meaning must be carried by labels and shapes, not colour.
 * - The source stays available under "Diagram source" as a text alternative;
 *   without JavaScript (or if a diagram fails to render) it is shown as is.
 * - Diagrams keep a readable minimum size and scroll inside their frame
 *   instead of widening the page.
 */

/* Shrink to fit down to 72% of natural size (14px labels stay ≥ 10px), then scroll */
const MIN_SCALE = 0.72

function token(styles: CSSStyleDeclaration, name: string): string {
  return styles.getPropertyValue(name).trim()
}

function themeConfig() {
  const root = document.documentElement
  const s = getComputedStyle(root)
  return {
    darkMode: root.getAttribute("data-theme") !== "light",
    fontFamily: getComputedStyle(document.body).fontFamily,
    fontSize: "14px",
    background: token(s, "--surface-sunken"),
    primaryColor: token(s, "--surface"),
    primaryTextColor: token(s, "--fg-strong"),
    primaryBorderColor: token(s, "--border-strong"),
    secondaryColor: token(s, "--mint"),
    secondaryTextColor: token(s, "--fg-strong"),
    secondaryBorderColor: token(s, "--border-strong"),
    tertiaryColor: token(s, "--surface-sunken"),
    tertiaryTextColor: token(s, "--fg-strong"),
    tertiaryBorderColor: token(s, "--border-strong"),
    lineColor: token(s, "--fg-muted"),
    textColor: token(s, "--fg"),
    mainBkg: token(s, "--surface"),
    nodeBorder: token(s, "--border-strong"),
    clusterBkg: token(s, "--surface-sunken"),
    clusterBorder: token(s, "--border-strong"),
    edgeLabelBackground: token(s, "--surface-sunken"),
    actorBkg: token(s, "--surface"),
    actorBorder: token(s, "--border-strong"),
    actorTextColor: token(s, "--fg-strong"),
    actorLineColor: token(s, "--fg-muted"),
    signalColor: token(s, "--fg-muted"),
    signalTextColor: token(s, "--fg"),
    labelBoxBkgColor: token(s, "--surface"),
    labelBoxBorderColor: token(s, "--border-strong"),
    labelTextColor: token(s, "--fg-strong"),
    loopTextColor: token(s, "--fg"),
    activationBkgColor: token(s, "--mint"),
    activationBorderColor: token(s, "--border-strong"),
    noteBkgColor: token(s, "--butter-soft"),
    noteTextColor: token(s, "--fg-strong"),
    noteBorderColor: token(s, "--border-strong"),
  }
}

function mount(container: HTMLElement, svgMarkup: string, source: string) {
  const canvas = document.createElement("div")
  canvas.className = "diagram-canvas"
  // Sanitised by Mermaid (securityLevel "strict")
  canvas.innerHTML = svgMarkup

  const svg = canvas.querySelector("svg")
  if (svg) {
    const width = svg.viewBox?.baseVal?.width || 0
    if (width > 0) {
      svg.style.maxWidth = `${Math.ceil(width)}px`
      svg.style.minWidth = `${Math.ceil(width * MIN_SCALE)}px`
    }
    svg.removeAttribute("height")
    // Without an accTitle in the source, name the diagram by its figure caption
    const captionId = container.dataset.captionId
    if (captionId && !svg.hasAttribute("aria-labelledby")) svg.setAttribute("aria-labelledby", captionId)
  }

  const details = document.createElement("details")
  details.className = "diagram-details"
  const summary = document.createElement("summary")
  summary.textContent = "Diagram source"
  const pre = document.createElement("pre")
  const code = document.createElement("code")
  code.textContent = source
  pre.append(code)
  details.append(summary, pre)

  container.replaceChildren(canvas, details)
  container.dataset.rendered = "true"
}

/* A frame that scrolls sideways can be focused and scrolled with the keyboard */
function updateScrollable(container: HTMLElement) {
  const canvas = container.querySelector<HTMLElement>(".diagram-canvas")
  if (!canvas) return
  if (canvas.scrollWidth > canvas.clientWidth + 1) {
    canvas.tabIndex = 0
    canvas.setAttribute("role", "group")
    canvas.setAttribute("aria-label", "Diagram (scrolls horizontally)")
  } else {
    canvas.removeAttribute("tabindex")
    canvas.removeAttribute("role")
    canvas.removeAttribute("aria-label")
  }
}

let renderCount = 0

export function MermaidDiagrams() {
  useEffect(() => {
    const containers = Array.from(document.querySelectorAll<HTMLElement>("[data-mermaid]"))
    if (containers.length === 0) return
    const sources = containers.map((c) => c.querySelector("code")?.textContent ?? "")
    let cancelled = false
    let generation = 0

    const render = async () => {
      // A newer render (theme toggled again) supersedes this one
      const current = ++generation
      const stale = () => cancelled || current !== generation
      const { default: mermaid } = await import("mermaid")
      if (stale()) return
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        // Mermaid 12 defaults to ELK (~420 KB gzipped); dagre is already loaded and enough for blog diagrams
        layout: "dagre",
        theme: "base",
        themeVariables: themeConfig(),
        fontFamily: getComputedStyle(document.body).fontFamily,
      })

      for (const [i, container] of containers.entries()) {
        const id = `mermaid-svg-${++renderCount}`
        try {
          const { svg } = await mermaid.render(id, sources[i])
          if (stale()) return
          mount(container, svg, sources[i])
          updateScrollable(container)
        } catch {
          // Leave the readable source in place, and drop Mermaid's leftover scratch element
          document.getElementById(`d${id}`)?.remove()
          document.getElementById(id)?.remove()
          container.dataset.rendered = "error"
        }
      }
    }

    void render()

    // Re-render with the other palette when the theme toggles
    const themeObserver = new MutationObserver(() => void render())
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    const onResize = () => containers.forEach(updateScrollable)
    window.addEventListener("resize", onResize)

    return () => {
      cancelled = true
      themeObserver.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return null
}
