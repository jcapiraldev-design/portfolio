#!/usr/bin/env node
/*
 * Measures the site with Google Lighthouse and saves the scores for the footer.
 *
 *   npm run scores                 desktop scores of your local build (default)
 *   npm run scores -- mobile       mobile scores
 *   npm run scores -- live         measure the live site instead (most accurate)
 *   npm run scores -- live mobile
 *
 * It builds the site, serves it locally with the same headers as Vercel, runs
 * Lighthouse on the homepage (using your installed Google Chrome), and writes
 * src/data/lighthouse.json. Run "npm run build" afterward to update the footer.
 */
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.SCORES_PORT || "3123";
const device = process.argv.includes("mobile") ? "mobile" : "desktop";
const live = process.argv.includes("live");
const LIVE_URL = "https://jaspercapiral-dev.vercel.app/";
const report = path.join(os.tmpdir(), "portfolio-lighthouse.json");

// Lighthouse 13 needs Node.js 22.19 or newer; older Node versions use Lighthouse 12
const [major, minor] = process.versions.node.split(".").map(Number);
const LIGHTHOUSE = major > 22 || (major === 22 && minor >= 19) ? "lighthouse@13.6.0" : "lighthouse@12.8.2";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
}

(async () => {
  let server = null;
  if (!live) {
    console.log("Starting a local preview…");
    server = spawn(process.execPath, [path.join(__dirname, "dev.js")], {
      cwd: ROOT,
      env: { ...process.env, PORT },
      stdio: ["ignore", "pipe", "inherit"],
    });
    await new Promise((resolve, reject) => {
      server.stdout.on("data", (d) => {
        if (String(d).includes("Preview:")) resolve();
      });
      server.on("exit", () => reject(new Error("The preview server stopped. Is port " + PORT + " free?")));
    });
  }
  const target = live ? LIVE_URL : `http://localhost:${PORT}/`;

  try {
    console.log(
      `Running Lighthouse (${device}, ${live ? "live site" : "local build"})… this takes about a minute.`,
    );
    const args = [
      "--yes",
      LIGHTHOUSE,
      target,
      "--output=json",
      `--output-path=${report}`,
      "--quiet",
      "--only-categories=performance,accessibility,best-practices,seo",
      `--chrome-flags=--headless=new ${process.env.LH_CHROME_FLAGS || ""}`.trim(),
    ];
    if (device === "desktop") args.push("--preset=desktop");
    run("npx", args);

    const lh = JSON.parse(fs.readFileSync(report, "utf8"));
    const score = (id) => Math.round((lh.categories[id].score || 0) * 100);
    const data = {
      date: new Date().toISOString().slice(0, 10),
      device,
      source: live ? "live" : "local",
      performance: score("performance"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
      seo: score("seo"),
    };
    fs.writeFileSync(path.join(ROOT, "src/data/lighthouse.json"), JSON.stringify(data, null, 2) + "\n");
    console.log("\nSaved src/data/lighthouse.json:", data);
    console.log('Run "npm run build" to update the footer.');
  } finally {
    if (server) server.kill();
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
