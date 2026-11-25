"use strict";

// Builds the site and pushes the output to a `build/<name>` branch based on
// gh-pages, then opens a PR against gh-pages. Merging that PR (e.g. from
// GitHub mobile) publishes the site — no local machine needed on publish day.

const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const name = process.argv[2];

if (!name || !/^[a-z0-9][a-z0-9._-]*$/i.test(name)) {
  console.error("Usage: bun run build-branch <name>");
  console.error("Example: bun run build-branch my-post-title");
  console.error("Name may contain letters, numbers, '.', '_' and '-'.");
  process.exit(1);
}

const branch = `build/${name}`;
const distDir = path.join(root, "dist");
const worktreeDir = path.join(os.tmpdir(), `build-branch-${name}`);

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

const run = (cmd, opts = {}) =>
  execSync(cmd, { cwd: root, stdio: "inherit", ...opts });

function removeWorktree() {
  try {
    execSync(`git worktree remove --force "${worktreeDir}"`, {
      cwd: root,
      stdio: "pipe",
    });
  } catch (_) {}
  if (fs.existsSync(worktreeDir)) fs.rmSync(worktreeDir, { recursive: true });
}

try {
  // Warn (don't block) about uncommitted work: the build uses the working tree.
  const dirty = execSync("git status --porcelain", { cwd: root })
    .toString()
    .trim();
  if (dirty) {
    console.warn(
      yellow("⚠  Uncommitted changes in the working tree will be included in the build.\n"),
    );
  }

  console.log(bold("Building site...\n"));
  // Start from a clean dist/ so files deleted from src/ don't linger.
  fs.rmSync(distDir, { recursive: true, force: true });
  run("bun run build");

  console.log(bold(`\nPreparing ${branch} from gh-pages...\n`));
  run("git fetch origin gh-pages");
  removeWorktree();
  try {
    execSync(`git branch -D "${branch}"`, { cwd: root, stdio: "pipe" });
  } catch (_) {}
  run(`git worktree add -b "${branch}" "${worktreeDir}" origin/gh-pages`);

  // Replace the branch contents with the fresh build.
  run("git rm -rf --quiet .", { cwd: worktreeDir });
  run(`cp -R "${distDir}/." "${worktreeDir}/"`);
  run("git add -A", { cwd: worktreeDir });

  const changed = execSync("git status --porcelain", { cwd: worktreeDir })
    .toString()
    .trim();
  if (!changed) {
    console.log(yellow("\nBuild is identical to gh-pages — nothing to publish."));
    removeWorktree();
    execSync(`git branch -D "${branch}"`, { cwd: root, stdio: "pipe" });
    process.exit(0);
  }

  const sha = execSync("git rev-parse --short HEAD", { cwd: root })
    .toString()
    .trim();
  run(`git commit --quiet -m "Build ${name} (${sha})"`, { cwd: worktreeDir });
  // --force so re-running the command refreshes an existing branch/PR.
  run(`git push --force origin "${branch}"`, { cwd: worktreeDir });
  removeWorktree();
  console.log(`\n${green("✓")} Pushed ${branch}`);

  // Open a PR, unless one is already open for this branch (force-push updated it).
  try {
    const existing = execSync(
      `gh pr list --head "${branch}" --base gh-pages --state open --json url --jq ".[0].url"`,
      { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
    )
      .toString()
      .trim();
    if (existing) {
      console.log(`${green("✓")} Updated existing PR: ${existing}`);
    } else {
      run(
        `gh pr create --base gh-pages --head "${branch}" ` +
          `--title "Publish: ${name}" ` +
          `--body "Built from commit ${sha}. Merge to publish."`,
      );
    }
  } catch (_) {
    console.warn(
      yellow(
        `\n⚠  Could not open the PR with the gh CLI. Open one manually from ${branch} into gh-pages.`,
      ),
    );
  }
} catch (err) {
  removeWorktree();
  console.error(red("\n✗ Failed:"), err.message || err);
  process.exit(1);
}
