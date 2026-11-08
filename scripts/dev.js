#!/usr/bin/env node
/*
 * Local preview: builds the site, rebuilds on every change, and serves dist/
 * at http://localhost:3000 (clean addresses and the 404 page work like on Vercel).
 *
 *   npm run dev
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { build, DIST } = require("./build");

const PORT = process.env.PORT || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
  ".ico": "image/x-icon", ".pdf": "application/pdf", ".xml": "application/xml", ".txt": "text/plain",
  ".webmanifest": "application/manifest+json",
};

build();
let timer;
for (const dir of ["src", "public"]) {
  fs.watch(path.join(__dirname, "..", dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
}

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(DIST, url);
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  let status = 200;
  if (!fs.existsSync(file)) { file = path.join(DIST, "404.html"); status = 404; }
  res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`\nPreview: http://localhost:${PORT}  (Ctrl + C to stop)`));
