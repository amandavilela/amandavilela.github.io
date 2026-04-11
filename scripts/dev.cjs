"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { processAll } = require("./images.cjs");

const root = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";
const sassBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWin ? "sass.cmd" : "sass",
);
const eleventyBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWin ? "eleventy.cmd" : "eleventy",
);

// ─── Sass watch ───────────────────────────────────────────────────────────────
// Compiles directly into dist/ so Eleventy's dev server can serve it.
// Source maps are enabled for easier debugging in DevTools.

const sass = spawn(
  sassBin,
  ["--watch", "src/scss/style.scss:dist/style.css", "--source-map"],
  { cwd: root, stdio: "inherit" },
);

sass.on("error", (err) => {
  console.error("[sass] Failed to start process:", err.message);
});

sass.on("close", (code) => {
  if (code !== null && code !== 0) {
    console.error(`[sass] Exited with code ${code}`);
  }
});

// ─── Eleventy dev server ──────────────────────────────────────────────────────
// Processes templates from src/ → dist/ and serves dist/ with live reload.
// HTML/Nunjucks changes trigger a rebuild; CSS changes are picked up directly.

const eleventy = spawn(eleventyBin, ["--serve", "--watch"], {
  cwd: root,
  stdio: "inherit",
});

eleventy.on("error", (err) => {
  console.error("[eleventy] Failed to start process:", err.message);
});

eleventy.on("close", (code) => {
  if (code !== null && code !== 0) {
    console.error(`[eleventy] Exited with code ${code}`);
  }
});

// ─── Image processing ─────────────────────────────────────────────────────────
// Runs once on startup, then watches src/blog/ for new or changed images and
// re-processes them automatically.

const PROCESSABLE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const blogSrcDir = path.join(root, "src", "blog");

processAll().catch((err) => console.error("[images]", err.message));

let imageDebounce;
if (fs.existsSync(blogSrcDir)) {
  fs.watch(blogSrcDir, { recursive: true }, (_, filename) => {
    if (!filename) return;
    if (!PROCESSABLE_EXTS.has(path.extname(filename).toLowerCase())) return;
    clearTimeout(imageDebounce);
    imageDebounce = setTimeout(() => {
      console.log(`[images] Processing ${filename}…`);
      processAll().catch((err) => console.error("[images]", err.message));
    }, 200);
  });
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

process.on("SIGINT", () => {
  console.log("\n[dev] Shutting down…\n");
  sass.kill("SIGTERM");
  eleventy.kill("SIGTERM");
  process.exit(0);
});
