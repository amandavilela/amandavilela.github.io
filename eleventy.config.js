"use strict";

const { minify } = require("html-minifier-terser");
const markdownIt = require("markdown-it");

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
    return collectionApi.getFilteredByGlob("src/blog/**/index.md").reverse();
  });

  eleventyConfig.addCollection("featured", function (collectionApi) {
    const now = new Date();
    return collectionApi
      .getFilteredByGlob("src/blog/**/index.md")
      .filter((item) => item.data.featured === true && item.date <= now)
      .reverse();
  });

  // ─── Date filters ─────────────────────────────────────────────────────────────
  eleventyConfig.addFilter("readableDate", (date) =>
    new Date(date).toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  eleventyConfig.addFilter("breadcrumbTitle", (title) => {
    if (!title) return "";
    return title.split(" | ")[0];
  });

  // ─── Tag filters ──────────────────────────────────────────────────────────────
  eleventyConfig.addFilter("getAllTags", (collection) => {
    const tagSet = new Set();
    (collection || []).forEach((item) => {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  eleventyConfig.addFilter(
    "relatedPosts",
    function (collection, currentUrl, currentCategory) {
      if (!collection) return [];

      let related = [];

      if (currentCategory) {
        related = collection.filter(
          (post) =>
            post.data.category === currentCategory && post.url !== currentUrl,
        );
      }

      if (related.length < 2) {
        const latest = collection.filter(
          (post) => post.url !== currentUrl && !related.includes(post),
        );
        related = [...related, ...latest].slice(0, 2);
      }

      return related;
    },
  );

  eleventyConfig.addFilter("htmlDateString", (date) =>
    new Date(date).toISOString().slice(0, 10),
  );

  // ─── File filters ─────────────────────────────────────────────────────────────
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
  eleventyConfig.addPassthroughCopy("src/CNAME");
  // gif, svg, videos and html files are not processed by Sharp — copy them as-is
  eleventyConfig.addPassthroughCopy("src/blog/**/*.{gif,svg,mp4,webm,html}");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "/robots.txt" });

  // ─── Markdown: wrap tables so wide ones scroll instead of breaking mobile layout ──
  const md = markdownIt({ html: true });

  // ─── Markdown: make every fenced code block copyable (picked up by /js/copy-code.js) ──
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    return defaultFence(tokens, idx, options, env, self).replace(
      /^<pre>/,
      "<pre data-copy-code>",
    );
  };

  const defaultTableOpen =
    md.renderer.rules.table_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
  const defaultTableClose =
    md.renderer.rules.table_close ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
  md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    return `<div class="table-scroll">${defaultTableOpen(tokens, idx, options, env, self)}`;
  };
  md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
    return `${defaultTableClose(tokens, idx, options, env, self)}</div>`;
  };
  eleventyConfig.setLibrary("md", md);

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
