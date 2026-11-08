#!/usr/bin/env node
/*
 * Builds the site into dist/.
 *
 *   src/pages/*.html     page settings + content          ┐
 *   src/partials/*.html  head, header, sidebar, footer     │
 *   src/styles/          CSS (main.css lists the files)    │  npm run build
 *   src/scripts/         JavaScript modules                ├────────────────►  dist/
 *   src/data/            projects.json                     │
 *   public/              files copied as they are          ┘
 *
 * CSS and JavaScript are bundled and minified with esbuild. Their file names include a
 * content hash (for example style-3F2A9C1B.css), so browsers can cache them for a long
 * time and still get the new version right after a change.
 *
 *   node scripts/build.js           build once
 *   node scripts/build.js --watch   rebuild whenever a file in src/ or public/ changes
 */
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

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

// JavaScript entry points: main.js on every page, plus each page's own module
const SCRIPT_ENTRIES = ["main.js", "pages/home.js", "pages/projects.js"];

const read = (p) => fs.readFileSync(p, "utf8");
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const a = path.join(from, entry.name),
      b = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

/* ---------- assets ---------- */

// Bundles CSS and JS, and returns a map from the public path (/assets/css/style.css)
// to the hashed file that was written (/assets/css/style-3F2A9C1B.css)
async function buildAssets() {
  const manifest = {};
  const record = (result, publicName) => {
    for (const [outFile, info] of Object.entries(result.metafile.outputs)) {
      if (!info.entryPoint) continue;
      const hashed = "/" + path.relative(DIST, path.join(ROOT, outFile)).split(path.sep).join("/");
      manifest[publicName(info.entryPoint)] = hashed;
    }
  };

  const css = await esbuild.build({
    entryPoints: { style: path.join(SRC, "styles/main.css") },
    bundle: true,
    minify: true,
    metafile: true,
    logLevel: "error",
    outdir: path.join(DIST, "assets/css"),
    entryNames: "[name]-[hash]",
    external: ["/assets/*"],
  });
  record(css, () => "/assets/css/style.css");

  const js = await esbuild.build({
    entryPoints: SCRIPT_ENTRIES.map((e) => path.join(SRC, "scripts", e)),
    outbase: path.join(SRC, "scripts"),
    bundle: true,
    splitting: true,
    format: "esm",
    minify: true,
    metafile: true,
    sourcemap: "linked",
    target: ["es2020"],
    logLevel: "error",
    outdir: path.join(DIST, "assets/js"),
    entryNames: "[dir]/[name]-[hash]",
    chunkNames: "chunks/[name]-[hash]",
  });
  record(
    js,
    (entry) =>
      "/assets/js/" +
      path.relative(path.join(SRC, "scripts"), path.join(ROOT, entry)).split(path.sep).join("/"),
  );

  return manifest;
}

/* ---------- pages ---------- */

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
  const out = template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, name, inner) =>
    flags[name] ? inner : "",
  );
  return out.replace(/\{\{(\w+)\}\}/g, (_, name) => (name in values ? values[name] : ""));
}

// Marks links to the current page: aria-current on all of them, plus "active" in the sidebar menu
function markCurrent(html, pagePath) {
  const target = new RegExp(`<a href="${pagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g");
  html = html.replace(target, (m) => `${m} aria-current="page"`);
  return html.replace(/(<ul class="menu">[\s\S]*?<\/ul>)/g, (menu) =>
    menu.replace(/<a href="([^"]+)" aria-current="page"/g, '<a href="$1" class="active" aria-current="page"'),
  );
}

function partial(name, page) {
  let html = read(path.join(SRC, "partials", name + ".html"));
  if (name === "sidebar") {
    // The homepage gets the section menu; other pages get the site menu
    const drop = page.key === "home" ? "site" : "home";
    html = html.replace(
      new RegExp(`\\n<!--[^>]*-->\\n<nav[^>]*data-menu="${drop}">[\\s\\S]*?<\\/nav>\\n`),
      "\n",
    );
  }
  return markCurrent(html, page.path).trim();
}

function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((l) => (l ? pad + l : l))
    .join("\n");
}

function buildPage(srcName, outName, manifest) {
  const { settings: s, rest } = readSettings(read(path.join(SRC, "pages", srcName)));
  const pageKey = (rest.match(/<body data-page="([^"]+)"/) || [])[1] || "home";
  const page = { key: pageKey, path: s.path || "/" };

  let body = rest,
    extra = "";
  body = body.replace(/<head-extra>([\s\S]*?)<\/head-extra>\s*/, (_, inner) => {
    extra = inner.trim() + "\n";
    return "";
  });

  // Shared parts written straight into the page
  body = body
    .replace("{{> sidebar}}", indent(partial("sidebar", page), 4))
    .replace("{{> header}}", indent(partial("header", page), 6))
    .replace("{{> footer}}", indent(partial("footer", page), 4));

  const scripts = (s.scripts || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((file) => `<script type="module" src="/assets/js/${file}"></script>\n`)
    .join("");

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
    { canonical: isPublic, robots: !!s.robots, social: isPublic && s.social !== "no" },
  );

  let html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n${head.trim()}\n</head>\n${body.trim()}\n</html>\n`;
  // Point to the hashed CSS and JS files
  for (const [plain, hashed] of Object.entries(manifest)) html = html.split(`"${plain}"`).join(`"${hashed}"`);

  const outPath = path.join(DIST, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
}

/* ---------- build ---------- */

async function build() {
  const started = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(PUBLIC, DIST);
  const manifest = await buildAssets();
  for (const [src, out] of Object.entries(PAGES)) buildPage(src, out, manifest);
  console.log(`Built dist/ in ${Date.now() - started} ms`);
}

async function safeBuild() {
  try {
    await build();
    return true;
  } catch (err) {
    console.error("Build failed:", err.message);
    process.exitCode = 1;
    return false;
  }
}

module.exports = { build: safeBuild, DIST };

if (require.main === module) {
  safeBuild().then(() => {
    if (!process.argv.includes("--watch")) return;
    console.log("Watching src/ and public/ for changes. Press Ctrl + C to stop.");
    let timer;
    const rebuild = () => {
      clearTimeout(timer);
      timer = setTimeout(safeBuild, 150);
    };
    for (const dir of [SRC, PUBLIC]) fs.watch(dir, { recursive: true }, rebuild);
  });
}
