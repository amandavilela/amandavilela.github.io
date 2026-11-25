# Amanda's portfolio

Static portfolio site for [amandavilela.me](https://amandavilela.me).

Built with [Eleventy](https://www.11ty.dev/) (templates + routing) and [Lightning CSS](https://lightningcss.dev/) (styles).

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

- Watches `src/css/` and re-bundles the CSS entry points into `dist/` with Lightning CSS on every change
- Eleventy processes templates from `src/` → `dist/` and serves `dist/` with live reload
- Blog images are resized on startup and re-processed when they change in `src/blog/`
- `Ctrl+C` shuts everything down
- Dev server runs at **http://localhost:8080** (Eleventy's default port)

## Build

Compile and emit a production-ready `dist/`:

```bash
bun run build
```

The build writes:

- `dist/*.css` — bundled and minified CSS for each entry point, optimized by Lightning CSS
- `dist/js/*.js` — scripts from `src/js/`, minified with Terser
- `dist/imgs/`, `dist/fonts/`, `dist/favicon.ico`, `dist/CNAME`, `dist/robots.txt` — copied as-is
- `dist/index.html` — homepage
- `dist/services/index.html` — services page at `/services/`
- `dist/blog/index.html` — blog listing at `/blog/`
- `dist/blog/<slug>/index.html` — one directory per post, e.g. `/blog/my-post/`
- `dist/blog/<slug>/*` — resized post images (see [Adding images to a post](#adding-images-to-a-post))
- `dist/tags/<tag>/index.html` — one listing page per tag
- `dist/sitemap.xml` and `dist/404.html`

HTML is minified via an Eleventy transform that runs when `NODE_ENV=production`.

## Project layout

```
src/
  _includes/
    layouts/
      base.njk          Shared HTML layout: <head>, footer, and content slot
      post.njk          Blog post layout — extends base.njk
  index.njk             Homepage — uses base.njk layout
  services.njk          Services page — served at /services/
  tags.njk              Paginated tag pages — served at /tags/<tag>/
  404.njk               Not-found page — output as /404.html
  sitemap.njk           Generates /sitemap.xml
  robots.txt, CNAME     Copied as-is to dist/
  blog/
    index.njk           Blog listing
    <slug>/             One folder per post
      index.md          Post content in Markdown
      *.{png,mp4,…}     Images and videos co-located with the post
  favicon.ico           Copied as-is to dist/
  imgs/                 Images referenced by pages
  fonts/                Self-hosted web fonts
  js/                   Client-side scripts (minified into dist/js/)
  css/
    critical.css       Base styles inlined on every page
    home_critical.css  Homepage-specific styles inlined on homepage
    *.css              Other entry points (listed in scripts/build.cjs and scripts/dev.cjs)
    config/            Project-wide configuration (variables, shared styles)
    base/              Low-level resets and typography
    components/        Reusable UI pieces
    sections/          Page-specific component sections

scripts/
  dev.cjs               CSS bundling + image processing + eleventy --serve for local development
  build.cjs             Bundles CSS, minifies JS, builds with Eleventy (NODE_ENV=production), resizes images
  images.cjs            Resizes blog images with Sharp
  deploy.cjs            Runs the build then publishes dist/ to the gh-pages branch
  build-branch.cjs      Builds and pushes dist/ to a build/<name> branch + opens a PR against gh-pages

eleventy.config.js      Eleventy configuration: collections, filters, passthrough copy,
                        Markdown tweaks, HTML minification

dist/                   Build output — do not edit manually
```

## Writing a blog post

Each post lives in its own folder under `src/blog/`. The folder name becomes the URL slug.

```
src/blog/my-post-title/index.md  →  /blog/my-post-title/
```

Post front matter:

```yaml
---
layout: layouts/post.njk
title: "Post title"
description: "One-line summary shown on the listing page."
keywords: "comma, separated, keywords"
date: 2025-06-01
featured: true
tags:
  - core web vitals
open_graph:
  image: "blog/my-post-title/og-image-my-post-title.webp"
---

Post content in Markdown.
```

Required:

- **`layout`** — must be `layouts/post.njk`
- **`title`** — used in the `<h1>`, the `<title>` tag, and the listing
- **`description`** — shown as the excerpt on `/blog/`; also used as the meta description
- **`date`** — determines the sort order on the listing (newest first); use `YYYY-MM-DD`

Optional:

- **`keywords`** — `<meta name="keywords">`
- **`featured`** — the newest featured post is highlighted on the homepage (falls back to the latest post)
- **`tags`** — creates `/tags/<tag>/` pages and is used for structured data
- **`open_graph.image`** — path (relative to the site root) to the social sharing image

The `post.njk` layout automatically sets `page_css: post` to load the appropriate styles.

## Adding images to a post

Place images in the same folder as the post:

```
src/blog/my-post-title/
  index.md
  my-image.png
```

Images in `jpg`, `jpeg`, `png`, `webp` and `avif` are processed by `scripts/images.cjs` (Sharp). For each image it writes to `dist/blog/<slug>/`:

- the original file, unchanged
- `<name>-320w`, `<name>-640w` and `<name>-960w` in the original format and as WebP

Files whose name starts with `og-image` are not resized; they are only converted to `<name>.webp` (use this for `open_graph.image`).

`gif`, `svg`, `mp4`, `webm` and `html` files are copied as-is.

Reference the resized variants with a `<picture>` element in the post's Markdown:

```html
<picture>
    <source srcset="my-image-960w.webp" media="(min-width: 640px)">
    <source srcset="my-image-640w.webp" media="(min-width: 320px)">
    <img src="my-image-320w.webp" width="300" height="150" loading="lazy" alt="Description of the image">
</picture>
```

Image processing runs automatically as part of `bun run build` and `bun run dev` (which also re-processes images when they change). To run it manually:

```bash
bun scripts/images.cjs
```

## Adding a new page

1. Create `src/your-page.njk` with front matter pointing to the shared layout:

```yaml
---
layout: layouts/base.njk
title: "Page Title | Amanda Vilela"
description: "Page description for SEO."
page_css: "your-page"
---
```

2. **`page_css`** (optional): The name of the CSS file to load (e.g., `your-page` will load `/your-page.css`).
3. If the page has its own CSS entry point, add it to `src/css/` and to the entry lists in both `scripts/build.cjs` and `scripts/dev.cjs`.
4. Write the page body (everything between `<body>` and the footer) as the template content.
5. Eleventy will output it to `dist/your-page/index.html`, giving the clean URL `/your-page/`.

## Deploy to GitHub Pages

GitHub Pages serves files from the **root** of the published branch. The `gh-pages` branch contains only the built site (the contents of `dist/`), not the source.

**Branch roles**

| Branch | Contents |
|--------|----------|
| `main` | Source: `src/`, `eleventy.config.js`, `package.json`, build scripts |
| `gh-pages` | Built site only — whatever `bun run build` writes into `dist/` |
| `build/<name>` | A built site waiting to be published — see [Publishing later](#publishing-later-from-a-pr) |

**One-time repo settings**

1. Go to repository **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set branch to **`gh-pages`**, folder **`/ (root)`**.

**Publish now**

Runs `bun run build`, commits the contents of `dist/` to `gh-pages` with an auto-generated message (`Deploy site (<short-sha>) <ISO-timestamp>`), and pushes to `origin`:

```bash
bun run deploy
```

The first run creates the `gh-pages` branch if it does not exist. If the command warns about an unclean working tree, commit or stash any pending changes first.

**Publishing later (from a PR)**

Use this to prepare a post (or any change) now and publish it on a later day without your computer, e.g. by merging from the GitHub mobile app.

```bash
bun run build-branch my-post-title
```

The command:

1. Runs a clean `bun run build` from your working tree (it warns if there are uncommitted changes, since they will be included).
2. Creates a `build/my-post-title` branch from `gh-pages` that contains only the built files.
3. Force-pushes it to `origin` and opens a PR into `gh-pages` (requires the [`gh` CLI](https://cli.github.com/), logged in). If a PR for that branch is already open, it is updated instead.

On the day you want to publish, merge the PR on GitHub. GitHub Pages deploys `gh-pages` automatically.

Things to keep in mind:

- **The PR is a full snapshot of the site at build time.** If `gh-pages` changes before you merge (another PR or a `bun run deploy`), the PR may conflict or be missing the newer changes. Re-run `bun run build-branch <same-name>` to rebuild it on top of the current `gh-pages`.
- **Don't run `bun run deploy` while a post is waiting** if that post is in your working tree: it would publish it right away. Keep unpublished posts on their own git branch until they're merged.
- Post dates are not checked: the post goes live when the PR is merged, whatever its `date` is. Set `date` to the day you plan to publish.
