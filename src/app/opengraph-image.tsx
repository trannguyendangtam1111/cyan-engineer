import { ImageResponse } from "next/og"
import { site } from "@/lib/site"

/* Social preview (1200×630), rendered at build time with the site's dark theme colours. */
export const alt = `${site.name} — ${site.role} · ${site.domain}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const C = {
  bg: "#111315",
  surface: "#181B1F",
  border: "#2A2F35",
  fg: "#E3E6E8",
  fgStrong: "#F7F8F8",
  muted: "#A1A7AE",
  accent: "#42D6E8",
  accentOn: "#0A1416",
  mint: "#16302F",
  mintInk: "#5FDDEC",
  butterSoft: "#33291A",
  butterInk: "#F6C969",
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: C.bg,
          backgroundImage:
            "radial-gradient(ellipse 70% 80% at 18% 45%, rgba(66, 214, 232, 0.16), rgba(17, 19, 21, 0) 70%)",
          color: C.fg,
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand: the top-bar mark + domain */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="7" fill={C.accent} />
            <rect x="6" y="7" width="12" height="4" rx="2" fill={C.accentOn} />
            <rect x="6" y="13" width="8" height="4" rx="2" fill={C.accentOn} opacity="0.5" />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.fgStrong }}>{site.domain}</div>
        </div>

        {/* Identity */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 8, borderRadius: 8, backgroundColor: C.accent }} />
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 3, color: C.mintInk }}>
              JAVA · SPRING BOOT · POSTGRESQL
            </div>
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              color: C.fgStrong,
            }}
          >
            {site.name}
          </div>
          <div style={{ marginTop: 14, fontSize: 40, fontWeight: 600, color: C.fg }}>
            {site.role}
          </div>
        </div>

        {/* Projects + availability */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {[
            { label: site.projects[0]?.name, bg: C.mint, ink: C.mintInk },
            { label: site.projects[1]?.name, bg: C.butterSoft, ink: C.butterInk },
          ]
            .filter((p) => p.label)
            .map((p) => (
              <div
                key={p.label}
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: 999,
                  backgroundColor: p.bg,
                  color: p.ink,
                  fontSize: 26,
                  fontWeight: 600,
                }}
              >
                {p.label}
              </div>
            ))}
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              padding: "10px 22px",
              borderRadius: 999,
              border: `2px solid ${C.border}`,
              backgroundColor: C.surface,
              color: C.muted,
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            {site.availability}
          </div>
        </div>
      </div>
    ),
    size
  )
}
