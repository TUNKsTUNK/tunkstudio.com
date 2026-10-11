// TUNK: production build for GitHub Pages (run by .github/workflows/deploy.yml).
//
//   node scripts/build.mjs _site
//
// index.html keeps its app code as an inline <script type="text/babel"> so
// Claude Design can edit and preview it as-is. Shipping that to visitors
// meant every page view downloaded Babel (~650 KB) and compiled the app in
// the browser before anything appeared. This copies the site to <outdir>,
// compiles that block once, here, into app.<hash>.js, and drops Babel from
// the page. scripts/prerender.py then builds the per-route pages from the
// compiled index.html.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Babel = require('@babel/standalone');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.resolve(process.argv[2] || '_site');
const SKIP = new Set(['.git', '.github', 'node_modules', 'scripts', path.basename(OUT)]);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
// entry by entry: OUT sits inside ROOT, and cpSync refuses to copy a folder into itself
for (const entry of fs.readdirSync(ROOT)) {
  if (!SKIP.has(entry)) fs.cpSync(path.join(ROOT, entry), path.join(OUT, entry), { recursive: true });
}

// Images are cached for hours by Cloudflare and browsers, so a replaced photo kept
// showing its old version. Version every asset path in the data files by content,
// the same way the scripts and styles are: an edited image gets a new URL at once.
// (Both data.js and img-variants.js are rewritten, so variant lookups still match.)
const assetVersion = {};
const versionAssets = (file) => {
  const f = path.join(OUT, file);
  if (!fs.existsSync(f)) return;
  const src = fs.readFileSync(f, 'utf8').replace(/assets\/[^"'\s?]+\.(?:jpe?g|png|webp|gif|mp4|webm)/gi, (m) => {
    const a = path.join(OUT, m);
    if (!fs.existsSync(a)) return m;
    assetVersion[m] = assetVersion[m] || crypto.createHash('sha1').update(fs.readFileSync(a)).digest('hex').slice(0, 8);
    return `${m}?v=${assetVersion[m]}`;
  });
  fs.writeFileSync(f, src);
};
versionAssets('data.js');
versionAssets('assets/img-variants.js');

const indexPath = path.join(OUT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const blocks = [...html.matchAll(/<script type="text\/babel" data-presets="react">([\s\S]*?)<\/script>/g)];
if (blocks.length !== 1) throw new Error(`build: expected 1 inline text/babel block in index.html, found ${blocks.length}`);
const babelTag = /\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]+"[^>]*><\/script>/;
if (!babelTag.test(html)) throw new Error('build: Babel <script> tag not found in index.html');

// same preset the browser used (react only), so the output behaves identically
const { code } = Babel.transform(blocks[0][1], { presets: ['react'], comments: false, compact: true });
const name = `app.${crypto.createHash('sha1').update(code).digest('hex').slice(0, 10)}.js`;
fs.writeFileSync(path.join(OUT, name), code);

html = html.replace(blocks[0][0], () => `<script src="${name}"></script>`).replace(babelTag, '');
// data.js etc. are cached by browsers for hours; version each local ?v= link by its
// content so an edit shows up immediately (no more bumping ?v= by hand)
html = html.replace(/(href|src)="([^":?]+\.(?:js|css))\?v=[^"]*"/g, (m, attr, file) => {
  const f = path.join(OUT, file);
  if (!fs.existsSync(f)) return m;
  return `${attr}="${file}?v=${crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 10)}"`;
});
fs.writeFileSync(indexPath, html);
// GitHub Pages serves 404.html for unknown paths; the app shows its home page there
fs.writeFileSync(path.join(OUT, '404.html'), html);

console.log(`build: ${OUT} (app ${(code.length / 1024).toFixed(0)} KB, Babel removed)`);
