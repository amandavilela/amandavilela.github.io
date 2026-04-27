"use strict";

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { processAll } = require("./images.cjs");

const root = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";
const eleventyBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWin ? "eleventy.cmd" : "eleventy",
);
const terserBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWin ? "terser.cmd" : "terser",
);

// ─── Formatting ───────────────────────────────────────────────────────────────

const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

// ─── Step runner ──────────────────────────────────────────────────────────────

async function step(label, fn) {
  const t = Date.now();
  try {
    await fn();
    console.log(`  ${green("✓")} ${label}  ${dim(`${Date.now() - t}ms`)}`);
  } catch (err) {
    console.log(`  ${red("✗")} ${label}`);
    const msg = (err.stderr?.toString() || err.message || "").trim();
    if (msg) console.error(dim(msg));
    process.exit(1);
  }
}

// ─── Build ────────────────────────────────────────────────────────────────────

(async () => {
  const total = Date.now();

  console.log(`\n${bold("Building...")}\n`);

  await step("Bundle CSS", () => {
    const entries = [
      "home",
      "blog",
      "critical",
      "services",
      "post",
      "404",
      "home_critical",
      "header",
    ];
    for (const name of entries) {
      execSync(
        `bun x lightningcss --bundle --minify --targets "last 2 versions" ./src/css/${name}.css -o ./dist/${name}.css`,
        { cwd: root, stdio: "pipe" },
      );
    }
  });

  await step("Minify JS", () => {
    const jsDir = path.join(root, "src/js");
    const distJsDir = path.join(root, "dist/js");

    if (!fs.existsSync(distJsDir)) {
      fs.mkdirSync(distJsDir, { recursive: true });
    }

    const files = fs.readdirSync(jsDir).filter((f) => f.endsWith(".js"));
    for (const file of files) {
      const input = path.join(jsDir, file);
      const output = path.join(distJsDir, file);
      execSync(`"${terserBin}" "${input}" -o "${output}" --compress --mangle`, {
        cwd: root,
        stdio: "pipe",
      });
    }
  });

  await step("Build with Eleventy", () => {
    execSync(`"${eleventyBin}"`, {
      cwd: root,
      stdio: "pipe",
      env: { ...process.env, NODE_ENV: "production" },
    });
  });

  await step("Resize images", () => processAll());

  console.log(`\n${dim(`  Done in ${Date.now() - total}ms`)}\n`);
})();
