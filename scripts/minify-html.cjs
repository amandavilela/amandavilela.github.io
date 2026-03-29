const fs = require("fs");
const { minify } = require("html-minifier");

const html = fs.readFileSync("src/index.html", "utf8");
const out = minify(html, {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  minifyJS: true,
});

fs.writeFileSync("dist/index.html", out);
