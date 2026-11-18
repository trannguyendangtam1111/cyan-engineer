import type { Destination } from "@/lib/site"

/*
 * Projects — single source of truth for every page that shows a project.
 *
 * Only verified facts belong here. Leave a field `null` (or omit `detail`)
 * rather than guessing; the UI hides what is missing.
 *
 * VERIFIED (local git remotes; public on GitHub, checked 2026-11-17)
 *   foodmap.repository    — dev/FoodMap → trannguyendangtam1111/FoodMap
 *   cyanarcade.repository — dev/GameHub → trannguyendangtam1111/cyan-arcade
 *   englishlab.repository — dev/EnglishLab → trannguyendangtam1111/englishLab
 *   stack, highlights     — each repo's README, cross-checked against its pom.xml
 *                           and source (Cyan Arcade: the `main` branch)
 *   englishlab            — README, backend/pom.xml and frontend/package.json on
 *                           the public `main` branch (9059f57). It has no AI
 *                           features yet, so none are claimed.
 *   detail (foodmap)      — README on the public `main` branch (d77878c);
 *                           screenshots from its docs/screenshots
 *   detail (cyanarcade)   — README on the public `main` branch (4798d0f);
 *                           screenshots from its docs/screenshots, excluding
 *                           those that show trading-card artwork
 *
 * NEEDS INPUT — null until the owner confirms
 *   status (all projects)
 */

export type ProjectStatus = "completed" | "in-development" | "paused"

export interface ProjectImage {
  src: string
  alt: string
}

export interface ProjectPoint {
  title: string
  description: string
}

export interface ProjectScreenshot extends ProjectImage {
  /** Intrinsic size of the PNG, so the page reserves the right space. */
  width: number
  height: number
  caption: string
}

/** Long-form content for /projects/[slug]. A project without it gets no detail page. */
export interface ProjectDetail {
  overview: string[]
  /** Technologies by layer, from the project's README. */
  stackGroups: { label: string; items: string[] }[]
  features: ProjectPoint[]
  /** Backend architecture and engineering decisions, when the repo documents them. */
  architecture?: ProjectPoint[]
  screenshots?: ProjectScreenshot[]
  /** Slugs of published blog posts about this project, in display order. Titles and links come from the post files. */
  relatedPosts?: string[]
}

export interface Project {
  /** Stable key for presentation lookups (icon, accent colour). */
  id: "foodmap" | "cyanarcade" | "englishlab"
  /** URL segment for /projects/[slug]. */
  slug: string
  name: string
  tagline: string
  /** Technology labels taken from each project's own README. */
  stack: string[]
  /** Backend engineering points, each traceable to the project's README. */
  highlights: string[]
  /** Screenshot in /public, copied from the project's docs/screenshots. `null` for list-only cards. */
  image: ProjectImage | null
  /** Public repository URL. */
  repository: Destination
  /** Shown on the homepage. Featured projects must have an image. */
  featured: boolean
  /** `null` until confirmed by the owner; never shown when null. */
  status: ProjectStatus | null
  detail?: ProjectDetail
}

export type FeaturedProject = Project & { featured: true; image: ProjectImage }

export const projects: Project[] = [
  {
    id: "foodmap",
    slug: "foodmap",
    name: "FoodMap",
    tagline: "Food and restaurant discovery for Ho Chi Minh City.",
    stack: ["Java 17", "Spring Boot", "PostgreSQL/PostGIS", "React"],
    highlights: [
      "JWT access tokens with hashed, rotating refresh tokens and reuse detection",
      "Vietnamese-aware search with pg_trgm and unaccent, plus PostGIS spatial filtering",
      "Versioned Flyway migrations and per-IP rate limiting",
    ],
    image: {
      src: "/projects/foodmap-home.png",
      alt: "FoodMap home page in Vietnamese: a food and restaurant search box, the “What to eat today?” picker, and food categories around central Ho Chi Minh City.",
    },
    repository: "https://github.com/trannguyendangtam1111/FoodMap",
    featured: true,
    status: null,
    detail: {
      overview: [
        "FoodMap is a food and restaurant discovery app for Ho Chi Minh City. It starts from the food rather than a restaurant list: roll or pick a dish, see which restaurants serve it, then open a restaurant.",
        "The Spring Boot backend owns those decisions. It searches Vietnamese text, ranks restaurants for each food, draws suggestions and filters by location with PostGIS. The React interface is available in English and Vietnamese.",
      ],
      stackGroups: [
        { label: "Backend", items: ["Java 17", "Spring Boot", "Spring Security", "Spring Data JPA", "Flyway"] },
        { label: "Database", items: ["PostgreSQL 16", "PostGIS", "pg_trgm", "unaccent"] },
        { label: "Frontend", items: ["React 18", "Vite", "React Router", "Tailwind CSS", "Goong JS"] },
        { label: "Testing", items: ["JUnit 5", "Mockito", "Testcontainers", "Vitest", "React Testing Library"] },
      ],
      features: [
        {
          title: "Vietnamese-aware search",
          description:
            "Searches restaurant names, menus and addresses using PostgreSQL full-text and trigram candidates, ranked for relevance on the server.",
        },
        {
          title: "Food-first suggestions",
          description:
            "“Cà mèn” draws an available food on the server, and rolling again excludes foods already shown. Each food opens a page of ranked restaurants that serve it.",
        },
        {
          title: "Food-aware map",
          description:
            "Restaurant and food modes with viewport-based loading. Food counts describe the area currently on the map, not the whole city.",
        },
        {
          title: "Restaurant details and reviews",
          description:
            "Address, contact details, opening hours, menu, ratings and reviews where data is available. Signed-in users can post reviews, and the server maintains the rating aggregates.",
        },
        {
          title: "Accounts",
          description:
            "Registration and login with JWT access tokens and hashed, rotating refresh tokens with reuse detection.",
        },
        {
          title: "English and Vietnamese",
          description:
            "An EN/VI switch that persists across refreshes. Restaurant names, dishes, addresses and reviews stay in their original language.",
        },
      ],
      architecture: [
        {
          title: "Layered, feature-based backend",
          description:
            "React SPA → Spring Boot REST API → PostgreSQL/PostGIS. Packages are organized by feature (auth, catalog, decision, restaurant, review, ingestion), and controllers delegate to services and repositories.",
        },
        {
          title: "Decisions made on the server",
          description:
            "Foods are drawn uniformly among those available after exclusions; restaurants by a ranking formula with a weighted top-N draw. A food is never swapped for another when no restaurant serves it.",
        },
        {
          title: "Search in the database",
          description:
            "pg_trgm and unaccent for Vietnamese text and PostGIS for spatial filtering, with bounded candidate sets, batched menu loading and pagination.",
        },
        {
          title: "Token security",
          description:
            "BCrypt passwords, signed JWT access tokens, and opaque refresh tokens stored as hashes, rotated on every use with reuse detection and optimistic locking.",
        },
        {
          title: "Schema ownership and rate limits",
          description:
            "Flyway owns the schema and Hibernate only validates it. Per-IP rate limits answer 429 with a Retry-After header.",
        },
        {
          title: "Controlled data ingestion",
          description:
            "Restaurant data comes from explicit Goong Places snapshot runs: dry-run by default, with request budgets, deduplication, validation, a PostgreSQL advisory lock and a JSON report. By default, browsing reads only the local database.",
        },
        {
          title: "Testing",
          description:
            "JUnit 5, Spring Boot Test and Mockito for the backend, plus optional Testcontainers PostgreSQL/PostGIS tests for Flyway migrations and PostgreSQL-specific search. Vitest and React Testing Library for the frontend.",
        },
      ],
      screenshots: [
        {
          src: "/projects/foodmap/food-page.png",
          alt: "FoodMap Food Page for phở around central Ho Chi Minh City, in Vietnamese: a suggested restaurant on the left and seven restaurants that serve phở on the right.",
          width: 1440,
          height: 900,
          caption: "Food Page: one suggested restaurant and a ranked list for the chosen dish.",
        },
        {
          src: "/projects/foodmap/restaurant-detail.png",
          alt: "FoodMap restaurant page for Phở Hòa Pasteur, in Vietnamese: category, opening status, a 4.5 rating from four reviews, address, phone number and a directions button.",
          width: 1440,
          height: 900,
          caption: "Restaurant detail with opening hours, rating and directions.",
        },
        {
          src: "/projects/foodmap/map.png",
          alt: "FoodMap map of central Ho Chi Minh City in restaurant mode, in Vietnamese: 145 restaurants in the map frame, listed on the left and shown as food icons on the map.",
          width: 1440,
          height: 900,
          caption: "Food-aware map, loading restaurants for the visible area.",
        },
      ],
      relatedPosts: [
        "jwt-vs-session-authentication-spring-boot",
        "location-based-restaurant-search-postgresql-postgis",
        "hibernate-native-query-postgresql-cast-syntax-error",
      ],
    },
  },
  {
    id: "cyanarcade",
    slug: "cyan-arcade",
    name: "Cyan Arcade",
    tagline: "A full-stack browser arcade with accounts, leaderboards, a coin economy, and trading-card packs.",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "React/TypeScript"],
    highlights: [
      "Spring Security session auth with CSRF protection and USER/ADMIN roles",
      "Transactional coin wallet with row locks, an auditable ledger, and idempotent purchases",
      "PostgreSQL Testcontainers, ArchUnit rules, and GitHub Actions CI",
    ],
    image: {
      src: "/projects/cyan-arcade-home.png",
      alt: "Cyan Arcade hub page: a welcome banner, completed daily challenges for Snake, 2048, and Tetris, and the featured games row.",
    },
    repository: "https://github.com/trannguyendangtam1111/cyan-arcade",
    featured: true,
    status: null,
    detail: {
      overview: [
        "Cyan Arcade is a full-stack browser arcade with player accounts, leaderboards, a coin economy, a shop, and server-side trading-card pack opening.",
        "It focuses on backend problems shared by business applications: protecting account access, validating client input, keeping balances and inventory correct under concurrency, and making retried operations safe. It is built as a modular monolith with shared platform services and separate game modules.",
      ],
      stackGroups: [
        { label: "Backend", items: ["Java 21", "Spring Boot 4", "Spring Security", "Spring Data JPA", "Flyway"] },
        { label: "Database", items: ["PostgreSQL 18"] },
        { label: "Frontend", items: ["React 19", "TypeScript", "Vite", "TanStack Query", "Tailwind CSS 4"] },
        { label: "Testing & tooling", items: ["JUnit", "MockMvc", "Testcontainers", "ArchUnit", "GitHub Actions", "Docker Compose"] },
      ],
      features: [
        {
          title: "Games",
          description:
            "Snake, 2048, Tetris, Minesweeper, Flappy Bird, Brick Breaker and Dino Run, plus Word Guess and Sudoku with answers and moves checked on the server, and Chess with server-enforced rules.",
        },
        {
          title: "Leaderboards and progression",
          description:
            "Daily, weekly and all-time leaderboards with deterministic ranking, plus XP, levels, achievements, daily challenges and a daily login reward.",
        },
        {
          title: "Coin economy and shop",
          description:
            "Coins with a transaction history and a shop for extra packs, badges, titles, profile frames and game skins. Inventory and equipment rules are enforced on the backend.",
        },
        {
          title: "Trading-card packs",
          description:
            "Pokémon and One Piece catalogs imported into PostgreSQL. Cards are drawn on the server using published simulator probabilities, and collections are grouped by game and set.",
        },
        {
          title: "Accounts and roles",
          description:
            "USER and ADMIN roles, public profiles and an admin dashboard. Guests can play; an account is needed to earn rewards, buy items and collect cards.",
        },
      ],
      architecture: [
        {
          title: "Modular monolith",
          description:
            "One Spring Boot application packaged by feature. Features talk through services and DTOs, never each other's entities, and ArchUnit rules block dependency cycles and controller access to persistence.",
        },
        {
          title: "Wallet integrity under concurrency",
          description:
            "A purchase locks the wallet row before checking ownership and balance, then writes the purchase, debit and inventory change in one transaction. A database check rejects negative balances, and every coin change is recorded in an auditable ledger.",
        },
        {
          title: "Idempotent pack opening",
          description:
            "Each opening stores a response snapshot under a unique (user, request ID) key and is serialized per player with a PostgreSQL advisory lock. A retry replays the original result; reusing the key for another pack returns 409.",
        },
        {
          title: "Safe score submission",
          description:
            "The game session is locked and its result validated before the score and progression changes are saved in one transaction. A unique constraint backs up the service check, so rewards are never granted twice.",
        },
        {
          title: "Session security",
          description:
            "Spring Security sessions with bcrypt, HttpOnly cookies, CSRF protection and USER/ADMIN authorization at HTTP and method level, plus request limits on registration, login and game-session creation.",
        },
        {
          title: "Schema and errors",
          description:
            "Flyway migrations with foreign keys, unique and check constraints and leaderboard indexes. Hibernate validates the schema, Open Session in View is off, and errors use RFC 9457 Problem Details.",
        },
        {
          title: "Automated verification",
          description:
            "JUnit, MockMvc, PostgreSQL Testcontainers and ArchUnit, run by GitHub Actions with Maven verify on Java 21, uploading test and JaCoCo reports.",
        },
      ],
      screenshots: [
        {
          src: "/projects/cyan-arcade/games.png",
          alt: "Cyan Arcade games catalog with category filters and cards for Snake, 2048 and Tetris, above a banner for card packs.",
          width: 1280,
          height: 900,
          caption: "Game catalog, filterable by category.",
        },
        {
          src: "/projects/cyan-arcade/leaderboard.png",
          alt: "Cyan Arcade 2048 leaderboard: six ranked runs with player names, avatars, scores, times and dates, with the signed-in player's row and best rank highlighted.",
          width: 1280,
          height: 900,
          caption: "Per-game leaderboard with the player's own rank.",
        },
        {
          src: "/projects/cyan-arcade/profile.png",
          alt: "Cyan Arcade profile page: avatar and level, an XP progress bar, statistics for games played, total score and achievements, and a recent games table.",
          width: 1280,
          height: 900,
          caption: "Profile with level, statistics and recent games.",
        },
        {
          src: "/projects/cyan-arcade/tetris-ai.png",
          alt: "Cyan Arcade Tetris in AI mode: the board, the next pieces, score, lines and level, and controls to change the AI's speed or pause it.",
          width: 1280,
          height: 900,
          caption: "Tetris AI mode, available to admins.",
        },
      ],
      relatedPosts: [
        "jwt-vs-session-authentication-spring-boot",
        "reliable-coin-wallet-spring-boot-postgresql",
      ],
    },
  },
  {
    id: "englishlab",
    slug: "englishlab",
    name: "EnglishLab",
    tagline: "A personal English learning platform with a daily study plan, vocabulary review, and IELTS practice.",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "React/TypeScript"],
    // List-only entry: no highlights, screenshot or detail page yet
    highlights: [],
    image: null,
    repository: "https://github.com/trannguyendangtam1111/englishLab",
    featured: false,
    status: null,
  },
]

function isFeatured(project: Project): project is FeaturedProject {
  return project.featured && project.image !== null
}

/** Homepage projects, in display order. */
export const featuredProjects: FeaturedProject[] = projects.filter(isFeatured)

/** Listed on /projects below the featured ones. */
export const otherProjects: Project[] = projects.filter((project) => !isFeatured(project))

export type DetailProject = Project & { detail: ProjectDetail; image: ProjectImage }

function hasDetail(project: Project): project is DetailProject {
  return project.detail !== undefined && project.image !== null
}

/** Projects with a /projects/[slug] page, in display order. */
export const detailProjects: DetailProject[] = projects.filter(hasDetail)
