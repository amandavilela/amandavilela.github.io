'use strict';

const { execSync } = require('child_process');
const fs           = require('fs');
const path         = require('path');
const { minify }   = require('html-minifier');

const root    = path.resolve(__dirname, '..');
const sassBin = path.join(root, 'node_modules', '.bin', 'sass');

// ─── Formatting ───────────────────────────────────────────────────────────────

const dim   = (s) => `\x1b[2m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;

function fileSize(rel) {
    try {
        const bytes = fs.statSync(path.join(root, rel)).size;
        return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`;
    } catch {
        return '';
    }
}

// ─── Step runner ─────────────────────────────────────────────────────────────

function step(label, fn, outputFile) {
    const t = Date.now();
    try {
        fn();
        const parts = [
            outputFile ? fileSize(outputFile) : null,
            `${Date.now() - t}ms`,
        ].filter(Boolean).join('  ');
        console.log(`  ${green('✓')} ${label}  ${dim(parts)}`);
    } catch (err) {
        console.log(`  ${red('✗')} ${label}`);
        const msg = (err.stderr?.toString() || err.message || '').trim();
        if (msg) console.error(dim(msg));
        process.exit(1);
    }
}

// ─── Build ────────────────────────────────────────────────────────────────────

const total = Date.now();
console.log(`\n${bold('Building...')}\n`);

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

step('Compile SCSS', () => {
    execSync(
        `${sassBin} src/scss/style.scss dist/style.css --style=compressed --no-source-map`,
        { cwd: root, stdio: 'pipe' }
    );
}, 'dist/style.css');

step('Copy images', () => {
    const src  = path.join(root, 'src', 'imgs');
    const dest = path.join(root, 'dist', 'imgs');
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(src, dest, { recursive: true });
});

step('Minify HTML', () => {
    const src = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');
    const out = minify(src, {
        collapseWhitespace:         true,
        removeComments:             true,
        removeRedundantAttributes:  true,
        removeScriptTypeAttributes: true,
        minifyJS:                   true,
    });
    fs.writeFileSync(path.join(root, 'dist', 'index.html'), out);
}, 'dist/index.html');

// Clean up artefacts that should never appear in dist/
fs.rmSync(path.join(root, 'dist', 'main.js'),      { force: true });
fs.rmSync(path.join(root, 'dist', 'node_modules'), { recursive: true, force: true });

console.log(`\n${dim(`  Done in ${Date.now() - total}ms`)}\n`);
