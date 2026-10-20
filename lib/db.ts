import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { DB } from "./types";

/**
 * Tiny file-backed datastore for the prototype. The whole dataset lives in
 * data/db.json, is cached in memory, and is written back atomically after
 * every mutation. Swap this module for Postgres/Prisma in production —
 * every caller goes through read() and mutate().
 */
const FILE = path.join(process.cwd(), "data", "db.json");
type Cache = { db: DB; mtime: number };
const g = globalThis as unknown as { __toriiDb?: Cache };

function load(): DB {
  if (!fs.existsSync(FILE)) {
    throw new Error("No database found. Run `npm run seed` first.");
  }
  const mtime = fs.statSync(FILE).mtimeMs;
  if (!g.__toriiDb || g.__toriiDb.mtime !== mtime) {
    g.__toriiDb = { db: JSON.parse(fs.readFileSync(FILE, "utf8")), mtime };
  }
  return g.__toriiDb.db;
}

export function read(): DB {
  return load();
}

export function mutate<T>(fn: (db: DB) => T): T {
  const db = load();
  const result = fn(db);
  save(db);
  return result;
}

export function save(db: DB) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, FILE);
  g.__toriiDb = { db, mtime: fs.statSync(FILE).mtimeMs };
}

export const id = (prefix = "") => prefix + crypto.randomBytes(6).toString("hex");
export const now = () => new Date().toISOString();
