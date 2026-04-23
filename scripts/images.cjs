"use strict";

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────

const WIDTHS = [320, 640, 960];
const PROCESSABLE = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const SRC_DIR = path.join(__dirname, "..", "src", "blog");
const DIST_DIR = path.join(__dirname, "..", "dist", "blog");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectImages(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(abs));
    } else if (PROCESSABLE.has(path.extname(entry.name).toLowerCase())) {
      results.push(abs);
    }
  }
  return results;
}

function isStale(srcPath, destPath) {
  if (!fs.existsSync(destPath)) return true;
  return fs.statSync(srcPath).mtimeMs > fs.statSync(destPath).mtimeMs;
}

// ─── Processing ───────────────────────────────────────────────────────────────

async function resizeImage(srcPath) {
  const relPath = path.relative(SRC_DIR, srcPath);
  const relDir = path.dirname(relPath);
  const destDir = path.join(DIST_DIR, relDir);
  fs.mkdirSync(destDir, { recursive: true });
  const baseName = path.basename(srcPath, path.extname(srcPath));
  const ext = path.extname(srcPath).slice(1).toLowerCase();

  // Copy the original as-is — fallback for plain Markdown ![alt](img.png) syntax
  const destOriginal = path.join(destDir, path.basename(srcPath));
  if (isStale(srcPath, destOriginal)) {
    fs.copyFileSync(srcPath, destOriginal);
  }

  // og-image: convert to WebP as-is, no resize
  if (baseName.startsWith("og-image")) {
    const destWebp = path.join(destDir, `${baseName}.webp`);
    if (isStale(srcPath, destWebp)) {
      await sharp(srcPath).webp({ quality: 85 }).toFile(destWebp);
    }
    return;
  }

  // Generate each responsive width in the native format and as WebP
  for (const width of WIDTHS) {
    const destNative = path.join(destDir, `${baseName}-${width}w.${ext}`);
    if (isStale(srcPath, destNative)) {
      await sharp(srcPath).resize(width).toFile(destNative);
    }
    const destWebp = path.join(destDir, `${baseName}-${width}w.webp`);
    if (isStale(srcPath, destWebp)) {
      await sharp(srcPath).resize(width).webp({ quality: 85 }).toFile(destWebp);
    }
  }
}

async function processAll() {
  const images = collectImages(SRC_DIR);
  await Promise.all(images.map(resizeImage));
}

module.exports = { processAll, collectImages, WIDTHS };

if (require.main === module) {
  processAll().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
