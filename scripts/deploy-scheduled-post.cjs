const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const [date, slug] = process.argv.slice(2);
if (!date || !slug) {
  console.error(
    "Usage: bun scripts/deploy-scheduled-post.cjs <YYYY-MM-DD> <slug>",
  );
  console.error(
    "Example: bun scripts/deploy-scheduled-post.cjs 2026-06-01 another-post",
  );
  process.exit(1);
}

const branchName = `post/${date}-${slug}`;
const distDir = path.resolve("dist");
const worktreeDir = path.join(
  os.tmpdir(),
  `eleventy-scheduled-${date}-${slug}`,
);

(async () => {
  try {
    console.log(
      `\x1b[1mBuilding for scheduled post: ${date}-${slug}...\x1b[0m`,
    );
    execSync("bun run build", { stdio: "inherit" });

    console.log(
      `\n\x1b[1mPreparing branch ${branchName} based on gh-pages...\x1b[0m`,
    );

    // 1. Fetch latest gh-pages
    execSync("git fetch origin gh-pages", { stdio: "inherit" });

    // 2. Delete local branch if it already exists
    try {
      execSync(`git branch -D ${branchName}`, { stdio: "pipe" });
    } catch (_) {}

    // 3. Clean up any leftover worktree from a previous failed run
    try {
      execSync(`git worktree remove --force "${worktreeDir}"`, {
        stdio: "pipe",
      });
    } catch (_) {}
    if (fs.existsSync(worktreeDir)) fs.rmSync(worktreeDir, { recursive: true });

    // 4. Create a worktree for the new branch (based on gh-pages = shared history)
    execSync(
      `git worktree add -b ${branchName} "${worktreeDir}" origin/gh-pages`,
      { stdio: "inherit" },
    );

    // 5. Inside the worktree: wipe everything, copy only dist/ contents
    execSync(`git rm -rf --quiet .`, { cwd: worktreeDir, stdio: "inherit" });
    execSync(`cp -r "${distDir}/." "${worktreeDir}/"`, { stdio: "inherit" });

    // 6. Commit and push from the worktree
    execSync("git add -A", { cwd: worktreeDir, stdio: "inherit" });
    execSync(`git commit -m "Scheduled post: ${date}-${slug}"`, {
      cwd: worktreeDir,
      stdio: "inherit",
    });
    execSync(`git push origin ${branchName} --force`, {
      cwd: worktreeDir,
      stdio: "inherit",
    });

    // 7. Clean up the worktree
    execSync(`git worktree remove --force "${worktreeDir}"`, {
      stdio: "inherit",
    });

    console.log(
      `\x1b[32m✓\x1b[0m Branch \x1b[36m${branchName}\x1b[0m pushed to origin.`,
    );

    try {
      console.log(`\n\x1b[1mCreating PR against gh-pages...\x1b[0m`);
      execSync(
        `gh pr create --base gh-pages --head ${branchName} ` +
          `--title "Scheduled post: ${date}-${slug}" ` +
          `--body "This PR was automatically created for the scheduled post on ${date}."`,
        { stdio: "inherit" },
      );
      console.log(`\x1b[32m✓\x1b[0m PR created successfully.`);
    } catch (err) {
      console.warn(
        "\n\x1b[33m⚠️  Note:\x1b[0m Could not create PR automatically. Make sure 'gh' CLI is installed and authenticated.",
      );
      console.warn(
        "You can manually create a PR from branch",
        branchName,
        "to gh-pages.",
      );
    }
  } catch (err) {
    // Clean up worktree on failure
    try {
      execSync(`git worktree remove --force "${worktreeDir}"`, {
        stdio: "pipe",
      });
    } catch (_) {}
    console.error("\n\x1b[31m✗ Deployment failed:\x1b[0m", err.message || err);
    process.exit(1);
  }
})();
