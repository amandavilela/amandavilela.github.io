"use strict";

const { minify } = require("html-minifier-terser");

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  minifyJS: true,
};

module.exports = function (eleventyConfig) {
  // ─── Blog posts collection ────────────────────────────────────────────────────
  eleventyConfig.addCollection("posts", function (collectionApi) {
    const now = new Date();
    return collectionApi
      .getFilteredByGlob("src/blog/**/index.md")
      .filter((item) => item.date <= now)
      .reverse();
  });

  // ─── Global Data ──────────────────────────────────────────────────────────────
  eleventyConfig.addGlobalData("now", () => new Date());

  // ─── Date filters ─────────────────────────────────────────────────────────────
  eleventyConfig.addFilter("readableDate", (date) =>
    new Date(date).toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  eleventyConfig.addFilter("htmlDateString", (date) =>
    new Date(date).toISOString().slice(0, 10),
  );

  // ─── CSS filters ──────────────────────────────────────────────────────────────
  eleventyConfig.addFilter("cssmin", function (code) {
    if (process.env.NODE_ENV === "production") {
      const CleanCSS = require("clean-css");
      return new CleanCSS({}).minify(code).styles;
    }
    return code;
  });

  eleventyConfig.addFilter("read_file", function (filePath) {
    const fs = require("fs");
    const path = require("path");
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf8");
    }
    return "";
  });

  // ─── Passthrough copy ────────────────────────────────────────────────────────
  eleventyConfig.addPassthroughCopy("src/imgs");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  // gif, svg, videos and html files are not processed by Sharp — copy them as-is
  eleventyConfig.addPassthroughCopy("src/blog/**/*.{gif,svg,mp4,webm,html}");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "/robots.txt" });

  // ─── Image shortcode ──────────────────────────────────────────────────────────
  // Usage in Markdown: {% image "photo.jpg", "Alt text" %}
  // Generates a <picture> with WebP + native format srcsets at 400, 800, 1200w.
  // Enable markdownTemplateEngine: "njk" (set below) for this to work in .md files.

  eleventyConfig.addShortcode("image", function (src, alt) {
    const baseName = src.replace(/\.[^.]+$/, "");
    const ext = src.split(".").pop().toLowerCase();
    const widths = [400, 800, 1200];
    const sizes = "(min-width: 1100px) 1100px, 100vw";

    const webpSrcset = widths
      .map((w) => `${baseName}-${w}w.webp ${w}w`)
      .join(", ");
    const nativeSrcset = widths
      .map((w) => `${baseName}-${w}w.${ext} ${w}w`)
      .join(", ");
    const fallbackSrc = `${baseName}-${widths[widths.length - 1]}w.${ext}`;

    return [
      `<picture>`,
      `  <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">`,
      `  <img src="${fallbackSrc}" srcset="${nativeSrcset}" sizes="${sizes}" alt="${alt}" loading="lazy" decoding="async">`,
      `</picture>`,
    ].join("\n");
  });

  // ─── Ignore compiled CSS / source maps ────────────────────────────────────────
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
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
  };
};
