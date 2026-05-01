const { execSync } = require("child_process");
const ghpages = require("gh-pages");

(async () => {
  try {
    console.log("Building...");
    execSync("bun run build", { stdio: "inherit" });

    let sha = "unknown";
    try {
      sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    } catch {
      // not a git repo or no commits
    }

    const message = `Deploy site (${sha}) ${new Date().toISOString()}`;

    console.log("Publishing to gh-pages...");
    await ghpages.publish("dist", {
      branch: "gh-pages",
      message,
      dotfiles: true,
    });

    console.log("Pushed dist/ to gh-pages:", message);
  } catch (err) {
    console.error("Deploy failed:", err);
    process.exit(1);
  }
})();
