/*
 * Small geometric illustrations. Decorative only (aria-hidden), drawn with
 * theme tokens so they follow light/dark without extra assets.
 */

interface IllustrationProps {
  className?: string
}

/*
 * Hero: three project tiles on a dot grid — a pin (FoodMap), a document
 * (Kairo) and a game pad (GameHub), plus a cyan "build" bar.
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

      {/* FoodMap tile — pin */}
      <rect x="28" y="30" width="76" height="80" rx="18" fill="var(--mint)" />
      <path
        d="M66 88s-13-12.5-13-23.5a13 13 0 0 1 26 0C79 75.5 66 88 66 88z"
        fill="var(--mint-ink)"
      />
      <circle cx="66" cy="64" r="4.5" fill="var(--mint)" />

      {/* Kairo tile — document lines */}
      <rect x="116" y="30" width="96" height="62" rx="16" fill="var(--lavender)" />
      <rect x="130" y="45" width="34" height="6" rx="3" fill="var(--lavender-ink)" />
      <rect x="130" y="58" width="66" height="4" rx="2" fill="var(--lavender-ink)" opacity="0.55" />
      <rect x="130" y="68" width="52" height="4" rx="2" fill="var(--lavender-ink)" opacity="0.55" />

      {/* GameHub tile — d-pad and buttons */}
      <rect x="116" y="102" width="96" height="52" rx="16" fill="var(--butter-soft)" />
      <rect x="132" y="125" width="18" height="6" rx="3" fill="var(--butter-ink)" />
      <rect x="138" y="119" width="6" height="18" rx="3" fill="var(--butter-ink)" />
      <circle cx="184" cy="123" r="4.5" fill="var(--butter-ink)" />
      <circle cx="195" cy="133" r="4.5" fill="var(--butter-ink)" opacity="0.6" />

      {/* Build bar */}
      <rect x="28.5" y="122.5" width="75" height="31" rx="11.5" fill="var(--surface-sunken)" stroke="var(--border)" />
      <rect x="38" y="135" width="38" height="6" rx="3" fill="var(--accent)" />
      <circle cx="90" cy="138" r="3" fill="var(--border-strong)" />

      {/* Pink accent */}
      <rect x="96" y="16" width="14" height="14" rx="4" fill="var(--pink)" transform="rotate(14 103 23)" />

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
