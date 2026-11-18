import fs from "node:fs"
import path from "node:path"
import MarkdownIt, { type Token } from "markdown-it"
import hljs from "highlight.js/lib/core"
import bash from "highlight.js/lib/languages/bash"
import http from "highlight.js/lib/languages/http"
import java from "highlight.js/lib/languages/java"
import json from "highlight.js/lib/languages/json"
import plaintext from "highlight.js/lib/languages/plaintext"
import sql from "highlight.js/lib/languages/sql"
import typescript from "highlight.js/lib/languages/typescript"
import { parse as parseYaml } from "yaml"

/*
 * File-based blog: one Markdown file per post in content/blog/, with YAML
 * frontmatter. Read with Node's fs while pages are generated on the server
 * (at build time for the static routes); nothing here reaches the client.
 *
 * Frontmatter:
 *   title        required  string
 *   description  required  string
 *   date         required  YYYY-MM-DD
 *   tags         optional  string[]          (default [])
 *   slug         optional  kebab-case string (default: file name)
 *   published    optional  boolean           (default false: drafts stay private)
 *
 * Every file is validated, drafts included, so a bad file fails the build.
 * Only published posts are returned by the functions below.
 */

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

export interface PostMeta {
  slug: string
  title: string
  description: string
  /** Calendar date, YYYY-MM-DD */
  date: string
  tags: string[]
  published: boolean
  /** Estimated reading time in whole minutes (at least 1), from the Markdown body. */
  readingMinutes: number
}

/** An h2/h3 of a post, in document order: the source of the table of contents. */
export interface PostHeading {
  /** Anchor id on the rendered heading, unique within the post. */
  id: string
  text: string
  level: 2 | 3
}

export interface Post extends PostMeta {
  /** Rendered from Markdown with raw HTML disabled (escaped, never passed through). */
  html: string
  headings: PostHeading[]
  /** The post has ```mermaid diagrams (the page then loads the diagram renderer). */
  hasDiagrams: boolean
}

interface Entry {
  file: string
  meta: PostMeta
  body: string
}

/*
 * Syntax highlighting at build time (no client JavaScript): highlight.js
 * escapes the code and wraps tokens in <span class="hljs-…">, coloured by
 * theme tokens in globals.css. Fence names: java, sql, json, http, bash
 * (sh, shell), typescript (ts), text (plaintext, txt). Any other name is
 * rendered as plain escaped text.
 */
for (const [name, language] of Object.entries({ bash, http, java, json, plaintext, sql, typescript })) {
  hljs.registerLanguage(name, language)
}
hljs.registerAliases(["shell", "console"], { languageName: "bash" })

function highlight(code: string, lang: string): string {
  const language = lang.toLowerCase()
  if (!language || !hljs.getLanguage(language)) return "" // markdown-it escapes it instead
  return hljs.highlight(code, { language, ignoreIllegals: true }).value
}

/* Raw HTML in Markdown is escaped; markdown-it also rejects javascript:/vbscript:/data: links. */
const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false, highlight })
const { escapeHtml } = markdown.utils

/*
 * Figures. A paragraph holding only an image becomes a <figure>; the image
 * title is the caption, with an optional source after " | Source: ":
 *
 *   ![Alt text describing the image](/blog/foo.png "What it shows | Source: [Origin](https://…)")
 *
 * A ```mermaid fence becomes a diagram figure; text after the fence name is
 * its caption, in the same format:
 *
 *   ```mermaid Request flow of a purchase | Source: ShopService.purchase
 *
 * Captioned figures are numbered in order (Figure 1, Figure 2 …). Captions
 * are rendered as inline Markdown (links, code), with raw HTML still escaped.
 */
interface FigureCaption {
  number: number
  caption: string
  source?: string
}

function parseCaption(text: string): Omit<FigureCaption, "number"> | null {
  const [caption, source] = text.split(/\s+\|\s+Source:\s*/i)
  if (!caption.trim()) return null
  return { caption: caption.trim(), source: source?.trim() || undefined }
}

function renderCaption(fig: FigureCaption | undefined): string {
  if (!fig) return ""
  const source = fig.source
    ? `<span class="figure-source">Source: ${markdown.renderInline(fig.source)}</span>`
    : ""
  return (
    `<figcaption id="figure-${fig.number}-caption">` +
    `<span class="figure-label">Figure ${fig.number}.</span> ${markdown.renderInline(fig.caption)}${source}` +
    `</figcaption>`
  )
}

function isMermaid(token: Token): boolean {
  return token.type === "fence" && token.info.trim().split(/\s+/)[0] === "mermaid"
}

markdown.core.ruler.push("figures", (state) => {
  if (state.inlineMode) return
  const tokens = state.tokens
  let count = 0

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (isMermaid(token)) {
      ;(state.env as { hasDiagrams?: boolean }).hasDiagrams = true
      const parsed = parseCaption(token.info.trim().replace(/^mermaid\s*/, ""))
      token.meta = { figure: parsed ? { ...parsed, number: ++count } : undefined }
      continue
    }

    // paragraph_open, inline (one image only), paragraph_close
    const inline = tokens[i + 1]
    const close = tokens[i + 2]
    if (
      token.type !== "paragraph_open" ||
      token.hidden ||
      inline?.type !== "inline" ||
      inline.children?.length !== 1 ||
      inline.children[0].type !== "image" ||
      close?.type !== "paragraph_close"
    ) {
      continue
    }

    const image = inline.children[0]
    const parsed = parseCaption(String(image.attrGet("title") ?? ""))
    const attrs = (image.attrs ?? []).filter(([name]) => name !== "title")
    image.attrs = [...attrs, ["loading", "lazy"], ["decoding", "async"]]

    token.tag = close.tag = "figure"
    token.attrSet("class", "figure")
    close.meta = { figure: parsed ? { ...parsed, number: ++count } : undefined }
    i += 2
  }
})

markdown.renderer.rules.paragraph_close = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  if (token.tag !== "figure") return self.renderToken(tokens, idx, options)
  return `${renderCaption(token.meta?.figure as FigureCaption | undefined)}</figure>\n`
}

/*
 * Mermaid: the source is sent as escaped text inside the figure (readable
 * without JavaScript); components/blog/mermaid-diagrams.tsx renders it to SVG
 * in the browser with Mermaid's strict security level.
 */
const defaultFence = markdown.renderer.rules.fence!
markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  if (!isMermaid(token)) return defaultFence(tokens, idx, options, env, self)
  const fig = token.meta?.figure as FigureCaption | undefined
  const labelledBy = fig ? ` data-caption-id="figure-${fig.number}-caption"` : ""
  return (
    `<figure class="figure figure-diagram">` +
    `<div class="diagram" data-mermaid${labelledBy}>` +
    `<pre class="diagram-source"><code>${escapeHtml(token.content)}</code></pre>` +
    `</div>${renderCaption(fig)}</figure>\n`
  )
}

/* "Session vs JWT at a glance" → "session-vs-jwt-at-a-glance"; accents folded, đ → d. */
function slugify(text: string): string {
  return (
    text
      .normalize("NFKD")
      .replace(/\p{M}+/gu, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  )
}

/*
 * Stable anchors: every h2/h3 gets an id derived from its text (deduplicated
 * with -2, -3 …), is recorded in env.headings for the table of contents, and
 * ends with a "#" link to itself. Ids only ever contain a-z, 0-9 and "-".
 */
markdown.core.ruler.push("heading_anchors", (state) => {
  const env = state.env as { headings?: PostHeading[] }
  const headings = (env.headings ??= [])
  const used = new Set(headings.map((h) => h.id))
  const tokens = state.tokens

  for (let i = 0; i < tokens.length; i++) {
    const open = tokens[i]
    if (open.type !== "heading_open" || (open.tag !== "h2" && open.tag !== "h3")) continue

    const inline = tokens[i + 1]
    const text = (inline.children ?? [])
      .filter((child) => child.type === "text" || child.type === "code_inline")
      .map((child) => child.content)
      .join("")
      .trim()

    const base = slugify(text)
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)

    open.attrSet("id", id)
    const close = tokens.slice(i + 2).find((t) => t.type === "heading_close")
    if (close) close.meta = { anchorId: id }
    headings.push({ id, text, level: open.tag === "h2" ? 2 : 3 })
  }
})

markdown.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
  const id = tokens[idx].meta?.anchorId as string | undefined
  const anchor = id
    ? ` <a class="heading-anchor" href="#${id}"><span aria-hidden="true">#</span><span class="sr-only">Link to this section</span></a>`
    : ""
  return anchor + self.renderToken(tokens, idx, options)
}

/* Words of the Markdown body (code included) at 220 words a minute, rounded up. */
const WORDS_PER_MINUTE = 220

function readingMinutes(body: string): number {
  const words = body.match(/[\p{L}\p{N}][\p{L}\p{N}'’._-]*/gu)?.length ?? 0
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const FIELDS = new Set(["title", "description", "date", "tags", "slug", "published"])

function fail(file: string, message: string): never {
  throw new Error(`content/blog/${file}: ${message}`)
}

function requiredString(data: Record<string, unknown>, key: string, file: string): string {
  const value = data[key]
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, `"${key}" is required and must be a non-empty string`)
  }
  return value.trim()
}

function parseEntry(file: string): Entry {
  const source = fs.readFileSync(path.join(BLOG_DIR, file), "utf8")
  const match = FRONTMATTER.exec(source)
  if (!match) fail(file, "missing frontmatter block (--- … ---) at the top of the file")

  let data: unknown
  try {
    data = parseYaml(match[1])
  } catch (error) {
    fail(file, `invalid frontmatter: ${(error as Error).message}`)
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    fail(file, "frontmatter must be a list of key: value fields")
  }
  const d = data as Record<string, unknown>

  const unknown = Object.keys(d).filter((key) => !FIELDS.has(key))
  if (unknown.length > 0) fail(file, `unknown frontmatter field(s): ${unknown.join(", ")}`)

  const title = requiredString(d, "title", file)
  const description = requiredString(d, "description", file)

  // YAML 1.2 keeps an unquoted 2026-01-31 as a string; check it is a real date.
  const date = requiredString(d, "date", file)
  if (!DATE.test(date) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    fail(file, `"date" must be a valid YYYY-MM-DD date, got "${date}"`)
  }

  const slug = d.slug === undefined ? file.replace(/\.md$/, "") : d.slug
  if (typeof slug !== "string" || !SLUG.test(slug)) {
    fail(file, `"slug" must be lowercase kebab-case (a-z, 0-9, -), got "${String(slug)}"`)
  }

  const tags = d.tags ?? []
  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string" && tag.trim() !== "")) {
    fail(file, `"tags" must be a list of non-empty strings`)
  }

  const published = d.published ?? false
  if (typeof published !== "boolean") fail(file, `"published" must be true or false`)

  const body = source.slice(match[0].length)
  return {
    file,
    meta: {
      slug,
      title,
      description,
      date,
      tags: tags.map((tag) => tag.trim()),
      published,
      readingMinutes: readingMinutes(body),
    },
    body,
  }
}

let cache: Entry[] | null = null

function loadEntries(): Entry[] {
  // Re-read on every call in development so edits show up without a restart.
  if (cache && process.env.NODE_ENV === "production") return cache

  const files = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".md")).sort()
    : []
  const entries = files.map(parseEntry)

  const seen = new Map<string, string>()
  for (const { file, meta } of entries) {
    const other = seen.get(meta.slug)
    if (other) fail(file, `slug "${meta.slug}" is already used by ${other}`)
    seen.set(meta.slug, file)
  }

  cache = entries
  return entries
}

function publishedEntries(): Entry[] {
  return loadEntries()
    .filter((entry) => entry.meta.published)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.meta.title.localeCompare(b.meta.title))
}

/** Published posts, newest first. */
export function getPublishedPosts(): PostMeta[] {
  return publishedEntries().map((entry) => entry.meta)
}

/** A published post with its rendered HTML and headings, or undefined for unknown or draft slugs. */
export function getPublishedPost(slug: string): Post | undefined {
  const entry = publishedEntries().find((e) => e.meta.slug === slug)
  if (!entry) return undefined
  const env: { headings?: PostHeading[]; hasDiagrams?: boolean } = {}
  const html = markdown.render(entry.body, env)
  return { ...entry.meta, html, headings: env.headings ?? [], hasDiagrams: env.hasDiagrams === true }
}

/** Slugs of published posts, for generateStaticParams. */
export function getPublishedSlugs(): string[] {
  return publishedEntries().map((entry) => entry.meta.slug)
}

/** "18 Nov 2026" — formatted in UTC so the date never shifts by time zone. */
export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
