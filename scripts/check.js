#!/usr/bin/env node
/*
 * Checks the built site in dist/ (run "npm run build" first):
 *   - every local link, image, stylesheet, and script points to a file that exists
 *   - every project screenshot and thumbnail in projects.json exists
 *   - every page has a title and a description
 *   - no inline scripts (they would be blocked by the Content Security Policy)
 *
 *   npm run check
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const problems = [];

if (!fs.existsSync(DIST)) {
  console.error("dist/ not found. Run: npm run build");
  process.exit(1);
}

function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
function exists(url) {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean) return true;
  let file = path.join(DIST, decodeURIComponent(clean));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  return fs.existsSync(file);
}
const isLocal = (u) => u.startsWith("/") && !u.startsWith("//") && !u.startsWith("/_vercel/");

const files = walk(DIST);
const pages = files.filter((f) => f.endsWith(".html"));

for (const page of pages) {
  const name = path.relative(DIST, page);
  const html = fs.readFileSync(page, "utf8");
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${name}: missing <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${name}: missing description`);
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/g))
    problems.push(`${name}: inline script ${m[0]}`);
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g))
    if (isLocal(m[1]) && !exists(m[1])) problems.push(`${name}: missing ${m[1]}`);
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/g))
    for (const part of m[1].split(",")) {
      const u = part.trim().split(/\s+/)[0];
      if (isLocal(u) && !exists(u)) problems.push(`${name}: missing ${u}`);
    }
}

for (const css of files.filter((f) => f.endsWith(".css")))
  for (const m of fs.readFileSync(css, "utf8").matchAll(/url\(\s*["']?(\/[^"')]+)["']?\s*\)/g))
    if (!exists(m[1])) problems.push(`${path.relative(DIST, css)}: missing ${m[1]}`);

const projects = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/projects.json"), "utf8"));
for (const p of projects) {
  if (!p.image) continue;
  if (!exists(p.image)) problems.push(`projects.json: ${p.name}: missing ${p.image}`);
  const thumb = p.image.replace(/\/projects\/([^/]+)$/, "/projects/thumbs/$1");
  if (!exists(thumb))
    problems.push(`projects.json: ${p.name}: missing thumbnail ${thumb} (run: npm run thumbnails)`);
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) found:\n` + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`✓ All good: ${pages.length} pages, ${projects.length} projects, every link and asset found.`);
