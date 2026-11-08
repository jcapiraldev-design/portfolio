#!/usr/bin/env node
/*
 * Creates 640px-wide card thumbnails for project screenshots that don't have one yet:
 *   public/assets/images/projects/name.webp  ->  public/assets/images/projects/thumbs/name.webp
 *
 * Uses the cwebp command (install it on a Mac with: brew install webp).
 *
 *   npm run thumbnails
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = path.resolve(__dirname, "../public/assets/images/projects");
const out = path.join(dir, "thumbs");
fs.mkdirSync(out, { recursive: true });

try {
  execFileSync("cwebp", ["-version"], { stdio: "ignore" });
} catch {
  console.error("cwebp not found. Install it with: brew install webp");
  process.exit(1);
}

let made = 0;
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".webp")) continue;
  const target = path.join(out, file);
  if (fs.existsSync(target)) continue;
  execFileSync("cwebp", ["-quiet", "-q", "78", "-resize", "640", "0", path.join(dir, file), "-o", target]);
  console.log("  ✓ thumbs/" + file);
  made++;
}
console.log(made ? `Created ${made} thumbnail(s).` : "All thumbnails are up to date.");
