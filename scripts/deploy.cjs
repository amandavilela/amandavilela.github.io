const { execSync } = require("child_process");
const ghpages = require("gh-pages");

execSync("npm run build", { stdio: "inherit" });

let sha = "unknown";
try {
  sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  // not a git repo or no commits
}

const message = `Deploy site (${sha}) ${new Date().toISOString()}`;

ghpages.publish(
  "dist",
  {
    branch: "gh-pages",
    message,
    src: ["**/*", "!node_modules/**"],
  },
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("Pushed dist/ to gh-pages:", message);
  },
);
