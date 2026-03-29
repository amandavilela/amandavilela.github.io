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
| `dist/` | **Published output** — run the build before deploying |
| `scripts/minify-html.cjs` | HTML minification step |

Edit files under `src/`, then run `npm run build` and commit the updated `dist/` if your hosting serves that folder.

## Local preview

After a build, serve `dist/` from a static server, for example:

```bash
npx --yes serve dist
```

Or open `dist/index.html` via any local static file server so asset paths resolve correctly.


