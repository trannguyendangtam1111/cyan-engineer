import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { site } from "@/lib/site"
import { TopBar } from "@/components/top-bar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const title = `${site.name} — ${site.role}`
const description = `${site.role}. ${site.pitch} Projects: ${site.projects
  .map((p) => p.name)
  .join(", ")}.`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  keywords: [
    "Java",
    "Backend Engineer",
    "Spring Boot",
    ...site.projects.map((p) => p.name),
  ],
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    title,
    description,
    url: site.url,
    siteName: site.domain,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: { index: true, follow: true },
}

// Dark is the default theme regardless of OS preference
export const viewport: Viewport = {
  themeColor: "#111315",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <TopBar />
        {children}
      </body>
    </html>
  )
}
