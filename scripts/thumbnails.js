#!/usr/bin/env node
/*
 * Creates the smaller images for project screenshots that don't have them yet:
 *   public/assets/images/projects/name.webp  ->  projects/thumbs/name.webp  (640px, project cards)
 *                                            ->  projects/wall/name.webp    (360px, homepage wall)
 *
 * Uses the cwebp command (install it on a Mac with: brew install webp).
 *
 *   npm run thumbnails
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = path.resolve(__dirname, "../public/assets/images/projects");
const SIZES = [
  { folder: "thumbs", width: "640", quality: "78" },
  { folder: "wall", width: "360", quality: "72" },
];
SIZES.forEach((s) => fs.mkdirSync(path.join(dir, s.folder), { recursive: true }));

try {
  execFileSync("cwebp", ["-version"], { stdio: "ignore" });
} catch {
  console.error("cwebp not found. Install it with: brew install webp");
  process.exit(1);
}

let made = 0;
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".webp")) continue;
  for (const size of SIZES) {
    const target = path.join(dir, size.folder, file);
    if (fs.existsSync(target)) continue;
    execFileSync("cwebp", [
      "-quiet",
      "-q",
      size.quality,
      "-resize",
      size.width,
      "0",
      path.join(dir, file),
      "-o",
      target,
    ]);
    console.log(`  ✓ ${size.folder}/${file}`);
    made++;
  }
}
console.log(made ? `Created ${made} image(s).` : "All thumbnails and wall images are up to date.");
