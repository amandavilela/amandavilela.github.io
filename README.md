# Amanda's portfolio

Static portfolio site for [amandavilela.me](https://amandavilela.me).

Built with [Eleventy](https://www.11ty.dev/) (templates + routing) and [Sass](https://sass-lang.com/) (styles).

## Getting started

1. Install [Bun](https://bun.sh/docs/installation) (v1.0 or later).
2. Install dependencies:

```bash
bun install
```

## Development

Start the dev server:

```bash
bun run dev
```

- Sass compiles `src/scss/style.scss` → `dist/style.css` (with source maps)
- Eleventy processes templates from `src/` → `dist/` and serves `dist/` with live reload
- Both processes run in parallel; `Ctrl+C` shuts them both down cleanly
- Dev server runs at **http://localhost:8080** (Eleventy's default port)

## Build

Compile and emit a production-ready `dist/`:

```bash
bun run build
```

The build writes:

- `dist/style.css` — compressed CSS, no source maps
- `dist/favicon.ico` — copied from `src/favicon.ico`
- `dist/imgs/` — copied from `src/imgs/`
- `dist/index.html` — homepage (minified)
- `dist/services/index.html` — services page at the clean URL `/services/` (minified)

HTML is minified via an Eleventy transform that runs when `NODE_ENV=production`.

## Project layout

```
src/
  _includes/
    layouts/
      base.njk          Shared HTML layout: <head>, footer, and content slot
  index.njk             Homepage — uses base.njk layout
  services.njk          Services page — served at /services/
  favicon.ico           Copied as-is to dist/
  imgs/                 Images referenced by pages
  scss/
    style.scss          Entry point — imports all partials in order
    config/             No CSS output; project-wide configuration
    base/               Element-level styles
    components/         Reusable UI pieces
    sections/           One file per page section

scripts/
  dev.cjs               Orchestrates sass --watch + eleventy --serve for local development
  build.cjs             Compiles SCSS then builds with Eleventy (NODE_ENV=production)
  deploy.cjs            Runs the build then publishes dist/ to the gh-pages branch

eleventy.config.js      Eleventy configuration: dirs, passthrough copy, minification transform

dist/                   Build output — do not edit manually
```

## Adding a new page

1. Create `src/your-page.njk` with front matter pointing to the shared layout:

```yaml
---
layout: layouts/base.njk
title: "Page Title | Amanda Vilela"
description: "Page description for SEO."
---
```

2. Write the page body (everything between `<body>` and the footer) as the template content.
3. Eleventy will output it to `dist/your-page/index.html`, giving the clean URL `/your-page/`.

## Deploy to GitHub Pages

GitHub Pages serves files from the **root** of the published branch. The `gh-pages` branch contains only the built site (the contents of `dist/`), not the source.

**Branch roles**

| Branch | Contents |
|--------|----------|
| `main` | Source: `src/`, `eleventy.config.js`, `package.json`, build scripts |
| `gh-pages` | Built site only — whatever `bun run build` writes into `dist/` |

**One-time repo settings**

1. Go to repository **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set branch to **`gh-pages`**, folder **`/ (root)`**.

**Publish**

Runs `bun run build`, commits the contents of `dist/` to `gh-pages` with an auto-generated message (`Deploy site (<short-sha>) <ISO-timestamp>`), and pushes to `origin`:

```bash
bun run deploy
```

The first run creates the `gh-pages` branch if it does not exist. If the command warns about an unclean working tree, commit or stash any pending changes first.
