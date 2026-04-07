"use strict";

const { execSync } = require("child_process");
const path = require("path");

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

// ─── Formatting ───────────────────────────────────────────────────────────────

const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

// ─── Step runner ──────────────────────────────────────────────────────────────

function step(label, fn) {
  const t = Date.now();
  try {
    fn();
    console.log(`  ${green("✓")} ${label}  ${dim(`${Date.now() - t}ms`)}`);
  } catch (err) {
    console.log(`  ${red("✗")} ${label}`);
    const msg = (err.stderr?.toString() || err.message || "").trim();
    if (msg) console.error(dim(msg));
    process.exit(1);
  }
}

// ─── Build ────────────────────────────────────────────────────────────────────

const total = Date.now();

console.log(`\n${bold("Building...")}\n`);

step("Compile SCSS", () => {
  execSync(
    `"${sassBin}" src/scss/style.scss dist/style.css --style=compressed --no-source-map`,
    { cwd: root, stdio: "pipe" },
  );
});

step("Build with Eleventy", () => {
  execSync(`"${eleventyBin}"`, {
    cwd: root,
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "production" },
  });
});

console.log(`\n${dim(`  Done in ${Date.now() - total}ms`)}\n`);
