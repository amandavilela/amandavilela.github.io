# Amanda's portfolio

Static portfolio site for [amandavilela.github.io](https://amandavilela.github.io).

## Requirements

- [Node.js](https://nodejs.org/) (LTS recommended) and npm

## Setup and build

Install dependencies:

```bash
npm install
```

Compile Sass, copy assets, and emit a minified `dist/index.html`:

```bash
npm run build
```

The build writes:

- `dist/style.css` — compressed CSS from `src/scss/`
- `dist/imgs/` — copied from `src/imgs/`
- `dist/index.html` — minified from `src/index.html`

## Project layout

| Path | Purpose |
|------|---------|
| `src/index.html` | Page markup (source) |
| `src/scss/` | Stylesheets (Sass modules) |
| `src/imgs/` | Images referenced by the build |
| `dist/` | **Build output** — generated locally; see [Deploy to GitHub Pages](#deploy-to-github-pages) |
| `scripts/minify-html.cjs` | HTML minification step |
| `scripts/deploy.cjs` | Build, commit to `gh-pages` with a fresh message, push |

## Deploy to GitHub Pages (`gh-pages` branch)

GitHub Pages serves files from the **root** of the published source. The `gh-pages` branch should look like the **inside** of `dist/` (e.g. `index.html` and `style.css` at the top level), not a folder literally named `dist/`.

**Branch roles**

| Branch | Contents |
|--------|----------|
| `main` / `dev` | Source: `src/`, `package.json`, build scripts. You can **omit committing `dist/`** here if you only publish via `gh-pages`. |
| `gh-pages` | **Only** the built site: whatever `npm run build` writes into `dist/`, pushed so it sits at the branch root. |

**One-time repo settings**

1. Repository **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **`gh-pages`**, folder: **`/` (root)**.

**Publish** — runs `npm run build`, then commits the contents of `dist/` to `gh-pages` with a new message each time (`Deploy site (<short-sha>) <ISO-timestamp>`), and pushes to `origin`:

```bash
npm run deploy
```

Implemented in `scripts/deploy.cjs`. The short SHA is the current `HEAD` on your working branch (what you are deploying from). Anything under `dist/node_modules/` is removed by `npm run build` and is excluded from the gh-pages publish step so dependencies are never deployed.

First run creates the `gh-pages` branch if it does not exist. If `gh-pages` warns about an unclean tree, commit or stash changes on your working branch first.

**Optional:** add `dist/` to `.gitignore` on `main` if you no longer want build artifacts in source control—keep deploying with `npm run deploy` only.

## Local preview

After a build, serve `dist/` from a static server, for example:

```bash
npx --yes serve dist
```

Or open `dist/index.html` via any local static file server so asset paths resolve correctly.


