# Amanda's portfolio

Static portfolio site for [amandavilela.me](https://amandavilela.me).

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

- Sass compiles `src/scss/style.scss` → `src/style.css` (with source maps, git-ignored)
- [browser-sync](https://browsersync.io/) serves `src/` at **http://localhost:3000**
- CSS changes are injected without a page reload; HTML and JS changes trigger a full reload
- `Ctrl+C` shuts both processes down cleanly

## Build

Compile and emit a production-ready `dist/`:

```bash
bun run build
```

The build writes:

- `dist/style.css` — compressed CSS, no source maps
- `dist/imgs/` — copied from `src/imgs/`
- `dist/index.html` — minified from `src/index.html`

## Project layout

```
src/
  index.html          Page markup
  imgs/               Images referenced by the page
  scss/
    style.scss        Entry point — imports all partials in order
    config/           No CSS output; project-wide configuration
      _variables.scss   Colour tokens and shared values
      _breakpoints.scss Breakpoint variables and responsive mixins
      _mixins.scss      Shared utility mixins (e.g. focus-ring)
    base/             Element-level styles
      _reset.scss       Global reset, accessibility base, shared layout utilities
      _typography.scss  Font, heading, and body text rules
    components/       Reusable UI pieces
      _buttons.scss     .btn styles
    sections/         One file per page section
      _hero.scss
      _focus.scss
      _how-i-work.scss
      _engagement.scss
      _contact.scss
      _footer.scss

scripts/
  dev.cjs             Orchestrates sass --watch + browser-sync for local development
  minify-html.cjs     HTML minification step used by npm run build
  deploy.cjs          Runs the build then publishes dist/ to the gh-pages branch

dist/                 Build output — do not edit manually
```

## Deploy to GitHub Pages

GitHub Pages serves files from the **root** of the published branch. The `gh-pages` branch contains only the built site (the contents of `dist/`), not the source.

**Branch roles**

| Branch | Contents |
|--------|----------|
| `main` | Source: `src/`, `package.json`, build scripts |
| `gh-pages` | Built site only — whatever `npm run build` writes into `dist/` |

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