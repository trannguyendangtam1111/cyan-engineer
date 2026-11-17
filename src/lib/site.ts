/*
 * Identity, projects and destinations — single source of truth for the homepage.
 *
 * A destination set to `null` renders as a clearly labelled "Coming soon"
 * state. Never put a guessed or example URL here.
 *
 * VERIFIED (local git remotes; public on GitHub, checked 2026-10-14)
 *   links.github     — profile
 *   kairo.href       — Desktop/Kairo   → trannguyendangtam1111/kairo
 *   gamehub.href     — Desktop/GameHub → trannguyendangtam1111/cyan-arcade
 *
 * NEEDS INPUT — null until real details exist
 *   links.cv, links.blog, links.linkedin, links.email
 *   foodmap.href     — the FoodMap repo has no git remote and no deployment config
 */
export type Destination = string | null

export interface Project {
  id: "foodmap" | "kairo" | "gamehub"
  name: string
  tagline: string
  /** Technology labels taken from each project's own README. */
  stack: string[]
  /** Public repository or live URL. */
  href: Destination
}

interface SiteConfig {
  name: string
  domain: string
  url: string
  role: string
  pitch: string
  availability: string
  links: {
    github: Destination
    cv: Destination
    /** The personal blog — not built yet. */
    blog: Destination
    linkedin: Destination
    /** Full `mailto:` URL. */
    email: Destination
  }
  projects: Project[]
}

export const site: SiteConfig = {
  name: "Cyan",
  domain: "cyan.engineer",
  url: "https://cyan.engineer",
  role: "Java Backend Engineer",
  pitch: "I build software projects with Java, Spring Boot, and modern web technologies.",
  availability: "Available for backend roles · Remote · EU",
  links: {
    github: "https://github.com/trannguyendangtam1111",
    cv: null,
    blog: null,
    linkedin: null,
    email: null,
  },
  projects: [
    {
      id: "foodmap",
      name: "FoodMap",
      tagline: "Venue search built on location data.",
      stack: ["Java", "Spring Boot", "PostGIS"],
      href: null,
    },
    {
      id: "kairo",
      name: "Kairo",
      tagline: "Turns study notes into validated, typed study documents.",
      stack: ["Java", "Spring Boot", "Next.js"],
      href: "https://github.com/trannguyendangtam1111/kairo",
    },
    {
      id: "gamehub",
      name: "GameHub",
      tagline: "A web game hub with arcade games, progression, achievements, and collectible cards.",
      stack: ["Java", "Spring Boot", "React"],
      href: "https://github.com/trannguyendangtam1111/cyan-arcade",
    },
  ],
}

/** Repository links on github.com open in a new tab. */
export function isExternal(href: string) {
  return /^https?:\/\//.test(href) && !href.startsWith(site.url)
}
