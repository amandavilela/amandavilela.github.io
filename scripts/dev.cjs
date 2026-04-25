"use strict";

const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { processAll } = require("./images.cjs");

const root = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";
const eleventyBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWin ? "eleventy.cmd" : "eleventy",
);

const cssEntries = ["home", "blog", "critical", "services", "post", "404", "home_critical"];

function compileCSS() {
    console.log("[css] Bundling with Lightning CSS...");
    for (const name of cssEntries) {
        try {
            execSync(
                `bun x lightningcss --bundle --targets ">= 0.25%" ./src/css/${name}.css -o ./dist/${name}.css`,
                { cwd: root, stdio: "inherit" }
            );
        } catch (err) {
            console.error(`[css:${name}] Failed to compile`);
        }
    }
    // Touch a file that Eleventy watches to trigger a rebuild
    const touchFile = path.join(root, "src/index.njk");
    if (fs.existsSync(touchFile)) {
        const now = new Date();
        fs.utimesSync(touchFile, now, now);
    }
}

// ─── CSS initial build & watch ────────────────────────────────────────────────
compileCSS();

const cssDir = path.join(root, "src/css");
fs.watch(cssDir, { recursive: true }, (event, filename) => {
    if (filename && filename.endsWith(".css")) {
        compileCSS();
    }
});

// ─── Eleventy dev server ──────────────────────────────────────────────────────
const eleventy = spawn(eleventyBin, ["--serve", "--watch"], {
  cwd: root,
  stdio: "inherit",
});

eleventy.on("error", (err) => {
  console.error("[eleventy] Failed to start process:", err.message);
});

// ─── Image processing ─────────────────────────────────────────────────────────
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
  eleventy.kill("SIGTERM");
  process.exit(0);
});
