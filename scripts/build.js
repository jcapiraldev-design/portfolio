#!/usr/bin/env node
/*
 * Builds the site into dist/.
 *
 *   src/pages/*.html       page settings + content      ┐
 *   src/partials/*.html    head, header, sidebar, footer │  node scripts/build.js
 *   src/styles/            stylesheets (main.css order)  ├──────────────────────►  dist/
 *   src/scripts/           JavaScript                    │
 *   src/data/              project list (JSON)           │
 *   public/                files copied as they are      ┘
 *
 * Usage:
 *   node scripts/build.js           build once
 *   node scripts/build.js --watch   rebuild whenever a file in src/ or public/ changes
 *
 * No packages needed, just Node.js.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");
const SITE = "https://jaspercapiral-dev.vercel.app";

// Source page -> output file (folders give clean addresses like /projects/)
const PAGES = {
  "index.html": "index.html",
  "projects.html": "projects/index.html",
  "case-studies.html": "case-studies/index.html",
  "404.html": "404.html",
};

const read = (p) => fs.readFileSync(p, "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

// Settings comment at the top of a page:  key: value
function readSettings(src) {
  const m = src.match(/^\s*<!--([\s\S]*?)-->/);
  const settings = {};
  if (m) {
    m[1].split("\n").forEach((line) => {
      const kv = line.match(/^\s*([a-z]+):\s*(.*?)\s*$/i);
      if (kv) settings[kv[1].toLowerCase()] = kv[2];
    });
  }
  return { settings, rest: m ? src.slice(m[0].length) : src };
}

// {{name}} values and {{#flag}} ... {{/flag}} blocks
function fill(template, values, flags) {
  const out = template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, name, inner) => (flags[name] ? inner : ""));
  return out.replace(/\{\{(\w+)\}\}/g, (_, name) => (name in values ? values[name] : ""));
}

// Marks links to the current page: aria-current on all of them, plus "active" in the sidebar menu
function markCurrent(html, pagePath) {
  const target = new RegExp(`<a href="${pagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g");
  html = html.replace(target, (m) => `${m} aria-current="page"`);
  return html.replace(/(<ul class="menu">[\s\S]*?<\/ul>)/g, (menu) =>
    menu.replace(/<a href="([^"]+)" aria-current="page"/g, '<a href="$1" class="active" aria-current="page"'));
}

function partial(name, page) {
  let html = read(path.join(SRC, "partials", name + ".html"));
  if (name === "sidebar") {
    // The homepage gets the section menu; other pages get the site menu
    const drop = page.key === "home" ? "site" : "home";
    html = html.replace(new RegExp(`\\n<!--[^>]*-->\\n<nav[^>]*data-menu="${drop}">[\\s\\S]*?<\\/nav>\\n`), "\n");
  }
  return markCurrent(html, page.path).trim();
}

function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text.split("\n").map((l) => (l ? pad + l : l)).join("\n");
}

function buildPage(srcName, outName) {
  const { settings: s, rest } = readSettings(read(path.join(SRC, "pages", srcName)));
  const pageKey = (rest.match(/<body data-page="([^"]+)"/) || [])[1] || "home";
  const page = { key: pageKey, path: s.path || "/" };

  let body = rest, extra = "";
  body = body.replace(/<head-extra>([\s\S]*?)<\/head-extra>\s*/, (_, inner) => { extra = inner.trim() + "\n"; return ""; });

  // Shared parts written straight into the page
  body = body
    .replace("{{> sidebar}}", indent(partial("sidebar", page), 4))
    .replace("{{> header}}", indent(partial("header", page), 6))
    .replace("{{> footer}}", indent(partial("footer", page), 4));

  const scripts = (s.scripts || "").split(",").map((x) => x.trim()).filter(Boolean)
    .map((file) => `<script type="module" src="/assets/js/${file}"></script>\n`).join("");

  const isPublic = !/noindex/i.test(s.robots || "");
  const head = fill(
    read(path.join(SRC, "partials/head.html")).replace(/^<!--[\s\S]*?-->\s*/, ""),
    {
      title: esc(s.title || "Jasper Capiral"),
      description: esc(s.description || ""),
      path: page.path,
      robots: esc(s.robots || ""),
      site: SITE,
      scripts,
      extra,
    },
    { canonical: isPublic, robots: !!s.robots, social: isPublic && s.social !== "no" }
  );

  const html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n${head.trim()}\n</head>\n${body.trim()}\n</html>\n`;
  const outPath = path.join(DIST, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`  ✓ ${outName}`);
}

// src/styles/main.css lists the style files in order; they are combined into one stylesheet
function buildStyles() {
  const dir = path.join(SRC, "styles");
  const css = read(path.join(dir, "main.css")).replace(/@import\s+"([^"]+)";/g, (_, file) =>
    `/* ---- ${file} ---- */\n` + read(path.join(dir, file)).trim() + "\n");
  const out = path.join(DIST, "assets/css/style.css");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, css);
}

// src/data/projects.json -> /assets/js/data/projects.js (an ES module), without offline projects
function buildData() {
  const list = JSON.parse(read(path.join(SRC, "data/projects.json"))).filter((p) => !p.offline);
  const out = path.join(DIST, "assets/js/data/projects.js");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `// Generated from src/data/projects.json by scripts/build.js\nexport const projects = ${JSON.stringify(list)};\n`);
}

function build() {
  const started = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(PUBLIC, DIST);
  buildStyles();
  copyDir(path.join(SRC, "scripts"), path.join(DIST, "assets/js"));
  buildData();
  for (const [src, out] of Object.entries(PAGES)) {
    try { buildPage(src, out); } catch (err) { console.error(`  ✗ ${src}: ${err.message}`); process.exitCode = 1; }
  }
  console.log(`Built dist/ in ${Date.now() - started} ms`);
}

module.exports = { build, DIST };

if (require.main === module) {
  build();
  if (process.argv.includes("--watch")) {
    console.log("Watching src/ and public/ for changes. Press Ctrl + C to stop.");
    let timer;
    const rebuild = () => { clearTimeout(timer); timer = setTimeout(build, 150); };
    for (const dir of [SRC, PUBLIC]) fs.watch(dir, { recursive: true }, rebuild);
  }
}
