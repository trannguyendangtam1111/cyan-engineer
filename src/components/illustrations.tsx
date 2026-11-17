/*
 * Small geometric illustrations. Decorative only (aria-hidden), drawn with
 * theme tokens so they follow light/dark without extra assets.
 */

interface IllustrationProps {
  className?: string
}

/*
 * Hero: two project tiles on a dot grid — a map pin (FoodMap, mint) and a
 * game pad (Cyan Arcade, butter) — over a cyan "build" bar shared by both.
 */
export function HeroProjects({ className }: IllustrationProps) {
  return (
    <svg
      width="240"
      height="180"
      viewBox="0 0 240 180"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <pattern id="hero-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="var(--border-strong)" />
        </pattern>
      </defs>

      <rect x="8" y="8" width="224" height="164" rx="24" fill="var(--surface)" />
      <rect x="8" y="8" width="224" height="164" rx="24" fill="url(#hero-dots)" opacity="0.6" />

      {/* FoodMap tile — map pin with two nearby places */}
      <rect x="28" y="30" width="88" height="88" rx="18" fill="var(--mint)" />
      <path
        d="M72 92s-13-12.5-13-23.5a13 13 0 0 1 26 0C85 79.5 72 92 72 92z"
        fill="var(--mint-ink)"
      />
      <circle cx="72" cy="68" r="4.5" fill="var(--mint)" />
      <circle cx="45" cy="100" r="3.5" fill="var(--mint-ink)" opacity="0.5" />
      <circle cx="99" cy="48" r="3.5" fill="var(--mint-ink)" opacity="0.5" />

      {/* Cyan Arcade tile — d-pad and two buttons */}
      <rect x="124" y="30" width="88" height="88" rx="18" fill="var(--butter-soft)" />
      <rect x="138" y="71" width="22" height="7" rx="3.5" fill="var(--butter-ink)" />
      <rect x="145.5" y="63.5" width="7" height="22" rx="3.5" fill="var(--butter-ink)" />
      <circle cx="185" cy="67" r="5" fill="var(--butter-ink)" />
      <circle cx="197" cy="80" r="5" fill="var(--butter-ink)" opacity="0.6" />

      {/* Build bar — one pipeline, both projects */}
      <rect x="28.5" y="130.5" width="183" height="25" rx="11.5" fill="var(--surface-sunken)" stroke="var(--border)" />
      <rect x="42" y="140" width="96" height="6" rx="3" fill="var(--accent)" />
      <circle cx="184" cy="143" r="3.5" fill="var(--mint-ink)" />
      <circle cx="197" cy="143" r="3.5" fill="var(--butter-ink)" />

      {/* Pink accent */}
      <rect x="113" y="15" width="14" height="14" rx="4" fill="var(--pink)" transform="rotate(14 120 22)" />

      <rect x="8.5" y="8.5" width="223" height="163" rx="23.5" stroke="var(--border)" />
    </svg>
  )
}

/* CV card: a résumé page with one highlighted line. */
export function CvGlyph({ className }: IllustrationProps) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="8.75"
        y="6.75"
        width="34.5"
        height="43.5"
        rx="8"
        fill="var(--surface)"
        stroke="var(--cv-border)"
        strokeWidth="1.5"
      />
      <rect x="16" y="15" width="14" height="4" rx="2" fill="var(--accent)" />
      <rect x="16" y="24" width="20" height="3" rx="1.5" fill="var(--border-strong)" />
      <rect x="16" y="31" width="16" height="3" rx="1.5" fill="var(--border-strong)" />
      <rect x="16" y="38" width="18" height="3" rx="1.5" fill="var(--border-strong)" />
      <circle cx="44" cy="10" r="6" fill="var(--butter)" />
    </svg>
  )
}
