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

- Lightning CSS watches `src/css/` and bundles entry points directly into `dist/`. Entry points are specified in `scripts/dev.cjs`.
- Eleventy processes templates from `src/` → `dist/` and serves `dist/` with live reload
- Both processes run in parallel; `Ctrl+C` shuts them both down cleanly
- Dev server runs at **http://localhost:8080** (Eleventy's default port)

## Build

Compile and emit a production-ready `dist/`:

```bash
bun run build
```

The build writes:

- `dist/*.css` — bundled and minified CSS for each entry point, optimized by Lightning CSS
- `dist/favicon.ico` — copied from `src/favicon.ico`
- `dist/imgs/` — copied from `src/imgs/`
- `dist/index.html` — homepage (minified)
- `dist/services/index.html` — services page at the clean URL `/services/` (minified)
- `dist/blog/index.html` — blog listing at `/blog/` (minified)
- `dist/blog/<slug>/index.html` — one directory per post, e.g. `/blog/my-post/` (minified)

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
  blog/
    index.njk           Blog listing — served at /blog/
    <slug>/             One folder per post
      index.md          Post content in Markdown
      *.{jpg,png,…}     Images co-located with the post
  favicon.ico           Copied as-is to dist/
  imgs/                 Images referenced by pages
  css/
    critical.css       Base styles inlined on every page
    home_critical.css  Homepage-specific styles inlined on /
    home.css           Non-critical styles for the homepage
    services.css       Styles for the services page
    blog.css           Styles for the blog listing page
    post.css           Styles for blog posts
    404.css            Styles for the 404 page
    header.css         Styles for the global header
    config/            Project-wide configuration (variables, shared styles)
    base/              Low-level resets and typography
    components/        Reusable UI pieces (buttons, lists, etc.)
    sections/          Page-specific component sections

scripts/
  dev.cjs               Orchestrates CSS bundling + eleventy --serve for local development
  build.cjs             Bundles CSS and builds with Eleventy (NODE_ENV=production)
  deploy.cjs            Runs the build then publishes dist/ to the gh-pages branch

eleventy.config.js      Eleventy configuration: dirs, passthrough copy, minification transform,
                        posts collection, readableDate and htmlDateString filters

dist/                   Build output — do not edit manually
```

## Writing a blog post

Each post lives in its own folder under `src/blog/`. The folder name becomes the URL slug.

```
src/blog/my-post-title/index.md  →  /blog/my-post-title/
```

Every post requires this front matter:

```yaml
---
layout: layouts/post.njk
title: "Post title"
description: "One-line summary shown on the listing page."
date: 2025-06-01
---

Post content in Markdown.
```

- **`layout`** — must be `layouts/post.njk`
- **`title`** — used in the `<h1>`, the `<title>` tag, and the listing
- **`description`** — shown as the excerpt on `/blog/`; also used as the meta description
- **`date`** — determines the sort order on the listing (newest first); use `YYYY-MM-DD`

The `post.njk` layout automatically sets `page_css: post` to load the appropriate styles.

## Adding images to a post

Place images in the same folder as the post:

```
src/blog/my-post-title/
  index.md
  my-image.png
```

Supported formats: `jpg`, `jpeg`, `png`, `webp`, `avif` (resized by Sharp), `gif`, `svg` (copied as-is).

### Responsive images with the `image` shortcode

Use the `{% image %}` shortcode to generate a `<picture>` element with WebP and native-format `srcset` at 400, 800, and 1200px:

```markdown
{% image "my-image.png", "Description of the image" %}
```

This outputs:

```html
<picture>
  <source type="image/webp" srcset="my-image-400w.webp 400w, my-image-800w.webp 800w, my-image-1200w.webp 1200w" sizes="(min-width: 1100px) 1100px, 100vw">
  <img src="my-image-1200w.png" srcset="my-image-400w.png 400w, my-image-800w.png 800w, my-image-1200w.png 1200w" sizes="(min-width: 1100px) 1100px, 100vw" alt="Description of the image" loading="lazy" decoding="async">
</picture>
```

The build pipeline (Sharp) generates all the resized variants automatically. The original file is also copied as a fallback so plain Markdown syntax `![alt](my-image.png)` still works.

### Image processing

The `scripts/images.cjs` script handles resizing. It runs automatically as part of `bun run build` (after the Eleventy step) and on startup during `bun run dev`. During development it also watches `src/blog/` for new or changed images and re-processes them without requiring a restart.

To process images manually:

```bash
node scripts/images.cjs
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
3. Write the page body (everything between `<body>` and the footer) as the template content.
4. Eleventy will output it to `dist/your-page/index.html`, giving the clean URL `/your-page/`.

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
