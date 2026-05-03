const { execSync } = require("child_process");
const ghpages = require("gh-pages");

const [date, slug] = process.argv.slice(2);

if (!date || !slug) {
  console.error("Usage: bun scripts/deploy-scheduled-post.cjs <YYYY-MM-DD> <slug>");
  console.error("Example: bun scripts/deploy-scheduled-post.cjs 2026-06-01 another-post");
  process.exit(1);
}

const branchName = `post/${date}-${slug}`;

(async () => {
  try {
    console.log(`\x1b[1mBuilding for scheduled post: ${date}-${slug}...\x1b[0m`);
    execSync("bun run build", { stdio: "inherit" });

    console.log(`\n\x1b[1mPreparing branch ${branchName} based on gh-pages...\x1b[0m`);
    
    // 1. Fetch latest gh-pages
    execSync("git fetch origin gh-pages", { stdio: "inherit" });
    
    // 2. Create the new branch locally from origin/gh-pages if it doesn't exist
    // If it exists, we just reset it to origin/gh-pages to ensure common history
    try {
      execSync(`git branch -D ${branchName}`, { stdio: "pipe" });
    } catch (e) {
      // ignore if branch doesn't exist
    }
    execSync(`git checkout -b ${branchName} origin/gh-pages`, { stdio: "inherit" });
    
    // 3. Switch back to previous branch (we only needed to create it)
    execSync("git checkout -", { stdio: "inherit" });

    console.log(`\n\x1b[1mPublishing to branch ${branchName}...\x1b[0m`);
    await new Promise((resolve, reject) => {
      ghpages.publish("dist", {
        branch: branchName,
        message: `Scheduled post: ${date}-${slug}`,
        dotfiles: true,
        // Using 'add: false' (default) will replace the contents, but keep the history
      }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(`\x1b[32m✓\x1b[0m Branch \x1b[36m${branchName}\x1b[0m pushed to origin.`);

    try {
      console.log(`\n\x1b[1mCreating PR against gh-pages...\x1b[0m`);
      // We use 'gh' CLI to create the PR. If it's not installed, it will fail gracefully.
      execSync(`gh pr create --base gh-pages --head ${branchName} --title "Scheduled post: ${date}-${slug}" --body "This PR was automatically created for the scheduled post on ${date}."`, { stdio: "inherit" });
      console.log(`\x1b[32m✓\x1b[0m PR created successfully.`);
    } catch (err) {
      console.warn("\n\x1b[33m⚠️  Note:\x1b[0m Could not create PR automatically. Make sure 'gh' CLI is installed and you are authenticated.");
      console.warn("You can manually create a PR from branch", branchName, "to gh-pages.");
    }

  } catch (err) {
    console.error("\n\x1b[31m✗ Deployment failed:\x1b[0m", err.message || err);
    process.exit(1);
  }
})();
