'use strict';

const browserSync = require('browser-sync');
const { spawn }   = require('child_process');
const path        = require('path');

const root    = path.resolve(__dirname, '..');
const isWin   = process.platform === 'win32';
const sassBin = path.join(root, 'node_modules', '.bin', isWin ? 'sass.cmd' : 'sass');

// ─── Sass watch ───────────────────────────────────────────────────────────────
// Compiles directly into src/ so browser-sync can pick up the file.
// Source maps are enabled for easier debugging in DevTools.

const sass = spawn(
  sassBin,
  [
    '--watch',
    'src/scss/style.scss:src/style.css',
    '--source-map',
  ],
  { cwd: root, stdio: 'inherit' }
);

sass.on('error', (err) => {
  console.error('[sass] Failed to start process:', err.message);
});

sass.on('close', (code) => {
  if (code !== null && code !== 0) {
    console.error(`[sass] Exited with code ${code}`);
  }
});

// ─── Browser-sync ─────────────────────────────────────────────────────────────
// Serves src/ directly (no build step needed in dev).
// CSS changes are injected without a full page reload.
// HTML and JS changes trigger a full reload.

const bs = browserSync.create();

bs.init({
  server: {
    baseDir: 'src',
    index:   'index.html',
  },
  files: [
    {
      match:  ['src/**/*.css'],
      fn:     (event, file) => bs.reload(file),
    },
    {
      match:  ['src/**/*.html', 'src/**/*.js'],
      fn:     () => bs.reload(),
    },
  ],
  open:   true,
  notify: false,
  port:   3000,
  ui:     { port: 3001 },
  logPrefix: 'dev',
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

process.on('SIGINT', () => {
  console.log('\n[dev] Shutting down…\n');
  sass.kill('SIGTERM');
  bs.exit();
  process.exit(0);
});
