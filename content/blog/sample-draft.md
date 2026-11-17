---
title: "Sample draft (not published)"
description: "A template that shows the supported frontmatter and Markdown. It is a draft and never appears on the site."
date: 2026-11-18
tags: [sample, template]
slug: sample-draft
published: false
---

> **Sample draft.** This file is a template, not an article. It stays unpublished
> (`published: false`), so it is not listed on /blog and /blog/sample-draft is a 404.
> To start a post, copy this file, give it a new slug, write it, and set
> `published: true` only after it has been reviewed.

## Frontmatter

| Field         | Required | Format                                   |
| ------------- | -------- | ---------------------------------------- |
| `title`       | yes      | text                                     |
| `description` | yes      | one or two sentences, used for metadata  |
| `date`        | yes      | `YYYY-MM-DD`                             |
| `tags`        | no       | list, e.g. `[spring-boot, postgresql]`   |
| `slug`        | no       | kebab-case; defaults to the file name    |
| `published`   | no       | `true` or `false`; defaults to `false`   |

## Supported Markdown

Paragraphs, **bold**, *italic*, [links](https://cyan.engineer/projects) and `inline code`.

### Lists

- Unordered item
- Another item

1. Ordered item
2. Another item

### Code blocks

```java
public record Example(String name) {}
```

### Quotes

> A blockquote.

Raw HTML such as <b>this</b> is shown as text, never rendered.
