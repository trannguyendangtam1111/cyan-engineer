import { ImageResponse } from "next/og"
import { site } from "@/lib/site"
import type { Project } from "@/lib/projects"

/*
 * Social preview template for a project case study (1200×630). Same dark
 * palette, brand mark and system font as the homepage card
 * (app/opengraph-image.tsx); the project's accent from the site theme
 * colours the stripe, glow and label.
 */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const C = {
  bg: "#111315",
  surface: "#181B1F",
  border: "#2A2F35",
  fg: "#E3E6E8",
  fgStrong: "#F7F8F8",
  muted: "#A1A7AE",
  accent: "#42D6E8",
  accentOn: "#0A1416",
}

/* Dark-theme project accents (globals.css), matching PROJECT_LOOK on the cards */
const ACCENT: Record<Project["id"], { stripe: string; soft: string; ink: string; glow: string }> = {
  foodmap: { stripe: "#5FDDEC", soft: "#16302F", ink: "#5FDDEC", glow: "95, 221, 236" },
  cyanarcade: { stripe: "#F6C969", soft: "#33291A", ink: "#F6C969", glow: "246, 201, 105" },
  englishlab: { stripe: "#B9ADFF", soft: "#252240", ink: "#B9ADFF", glow: "185, 173, 255" },
}

export function projectOgImage(project: Pick<Project, "id" | "name" | "tagline" | "stack">) {
  const a = ACCENT[project.id]

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
          position: "relative",
          backgroundColor: C.bg,
          backgroundImage: `radial-gradient(ellipse 70% 80% at 18% 50%, rgba(${a.glow}, 0.14), rgba(17, 19, 21, 0) 70%)`,
          color: C.fg,
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent stripe, as on the project cards */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: OG_SIZE.width,
            height: 10,
            backgroundColor: a.stripe,
          }}
        />

        {/* Brand + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="7" fill={C.accent} />
            <rect x="6" y="7" width="12" height="4" rx="2" fill={C.accentOn} />
            <rect x="6" y="13" width="8" height="4" rx="2" fill={C.accentOn} opacity="0.5" />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.fgStrong }}>{site.domain}</div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              padding: "10px 22px",
              borderRadius: 999,
              backgroundColor: a.soft,
              color: a.ink,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 3,
            }}
          >
            PROJECT CASE STUDY
          </div>
        </div>

        {/* Project */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 36, height: 8, borderRadius: 8, backgroundColor: a.stripe }} />
          <div
            style={{
              marginTop: 22,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              color: C.fgStrong,
            }}
          >
            {project.name}
          </div>
          <div
            style={{
              marginTop: 18,
              maxWidth: 980,
              fontSize: 36,
              fontWeight: 500,
              lineHeight: 1.35,
              color: C.fg,
            }}
          >
            {project.tagline}
          </div>
        </div>

        {/* Stack */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {project.stack.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                flexShrink: 0,
                whiteSpace: "nowrap",
                padding: "8px 18px",
                borderRadius: 999,
                border: `2px solid ${C.border}`,
                backgroundColor: C.surface,
                color: C.fg,
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE
  )
}
