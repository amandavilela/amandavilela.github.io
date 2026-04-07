"use strict";

const { minify } = require("html-minifier");

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  minifyJS: true,
};

module.exports = function (eleventyConfig) {
  // ─── Passthrough copy ────────────────────────────────────────────────────────
  eleventyConfig.addPassthroughCopy("src/imgs");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");

  // Ignore compiled CSS / source maps — handled separately by Sass
  eleventyConfig.ignores.add("src/style.css");
  eleventyConfig.ignores.add("src/style.css.map");

  // ─── HTML minification (production only) ─────────────────────────────────────
  if (process.env.NODE_ENV === "production") {
    eleventyConfig.addTransform("htmlmin", function (content) {
      if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
        return minify(content, minifyOptions);
      }
      return content;
    });
  }

  // ─── Eleventy config ──────────────────────────────────────────────────────────
  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
    },
    templateFormats: ["njk", "html", "md"],
  };
};
