#!/usr/bin/env node
/*
 * Runs before `npm run dev` and `npm run build`. If the catalogue hasn't been filled from AniList yet,
 * it imports the top 400 manga (covers, banners, trailers, character art) and reseeds. This is what
 * makes a fresh Vercel deploy show 400 titles with artwork without anyone running a command.
 *
 * It never fails the build: without network access the app keeps the 14 built-in series, and the
 * browser fills their artwork from AniList at runtime instead.
 * Set TORII_SKIP_IMPORT=1 to turn it off.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const aniFile = path.join(root, "data", "anilist.json");
const catFile = path.join(root, "data", "catalog.json");
const run = (cmd, args) => spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" }).status ?? 1;

if (process.env.TORII_SKIP_IMPORT === "1") process.exit(0);

let source = "builtin";
try { source = JSON.parse(fs.readFileSync(catFile, "utf8")).meta?.source ?? "builtin"; } catch {}

if (!fs.existsSync(aniFile)) {
  console.log("[torii] No AniList data yet. Importing the top 400 manga (takes about a minute)…");
  run(process.execPath, [path.join(root, "scripts", "import-anilist.mjs"), "--soft"]);
}

// Reseed when there is AniList data the catalogue doesn't use yet.
const aniNewer = fs.existsSync(aniFile) && (!fs.existsSync(catFile) || fs.statSync(aniFile).mtimeMs > fs.statSync(catFile).mtimeMs);
if (fs.existsSync(aniFile) && (source !== "anilist" || aniNewer)) {
  console.log("[torii] Building the catalogue from AniList data…");
  const tsx = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "tsx.cmd" : "tsx");
  if (run(tsx, [path.join("scripts", "seed.ts")]) !== 0) console.warn("[torii] Reseed failed; keeping the current catalogue.");
}
