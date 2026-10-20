import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import catalogJson from "@/data/catalog.json";
import initialStateJson from "@/data/initial-state.json";
import type { Catalog, DB, State } from "./types";

/**
 * Storage for the prototype.
 *
 * - The catalogue (series, chapters, volumes, figures, seeded analytics) is static and
 *   bundled with the app from data/catalog.json.
 * - Everything that changes (users, carts, orders, unlocks, tags, settings, stock) is a small
 *   "state" document. It lives in Upstash Redis when its env vars are set (Vercel), otherwise
 *   in data/state.json on disk (local dev, Render, any VPS).
 *
 * Callers see one merged DB object through read() and mutate(), so this module can later be
 * swapped for Postgres without touching the rest of the app.
 */
const catalog = catalogJson as unknown as Catalog;
const initialState = initialStateJson as unknown as State;
const KEY = "torii:state:v1";
const FILE = path.join(process.cwd(), "data", "state.json");

const redisUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
export const storageMode = () => (redisUrl() && redisToken() ? "redis" : "file");

async function redis(cmd: (string | number)[]) {
  const r = await fetch(redisUrl(), {
    method: "POST", headers: { authorization: `Bearer ${redisToken()}`, "content-type": "application/json" },
    body: JSON.stringify(cmd), cache: "no-store",
  });
  if (!r.ok) throw new Error(`Redis error ${r.status}`);
  return (await r.json()) as { result: unknown };
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

async function loadState(): Promise<State> {
  if (storageMode() === "redis") {
    const { result } = await redis(["GET", KEY]);
    if (typeof result === "string") return JSON.parse(result);
    const s = clone(initialState);
    await redis(["SET", KEY, JSON.stringify(s)]);
    return s;
  }
  if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, "utf8"));
  return clone(initialState);
}

async function saveState(s: State) {
  if (storageMode() === "redis") { await redis(["SET", KEY, JSON.stringify(s)]); return; }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE + ".tmp", JSON.stringify(s));
  fs.renameSync(FILE + ".tmp", FILE);
}

/** Merge static catalogue + state. `deep` clones mutable catalogue rows so mutate() can edit them safely. */
function compose(s: State, deep: boolean): DB {
  const chapters = catalog.chapters.map((c) => {
    const o = s.chapterOverrides[c.id];
    return o === undefined ? (deep ? { ...c } : c) : { ...c, freeOverride: o };
  });
  const volumes = catalog.volumes.map((v) => (s.stock[v.id] !== undefined ? { ...v, stock: s.stock[v.id] } : deep ? { ...v } : v));
  const figures = catalog.figures.map((f) => {
    const st = s.stock[f.id], ed = s.editionSold[f.id];
    return st === undefined && ed === undefined ? (deep ? { ...f } : f) : { ...f, stock: st ?? f.stock, editionSold: ed ?? f.editionSold };
  });
  return {
    publishers: catalog.publishers, series: catalog.series, boxSets: catalog.boxSets, chapters, volumes, figures,
    users: s.users, unlocks: s.unlocks, progress: s.progress, cart: s.cart, orders: s.orders, tags: s.tags,
    ownership: s.ownership, settings: s.settings, events: [...catalog.events, ...s.events],
  };
}

/** Pull the changed parts of a DB back out into a State document. */
function decompose(db: DB): State {
  const chapterOverrides: Record<string, boolean> = {};
  db.chapters.forEach((c, i) => { if (c.freeOverride !== catalog.chapters[i].freeOverride && c.freeOverride !== null) chapterOverrides[c.id] = c.freeOverride; });
  const stock: Record<string, number> = {}, editionSold: Record<string, number> = {};
  db.volumes.forEach((v, i) => { if (v.stock !== catalog.volumes[i].stock) stock[v.id] = v.stock; });
  db.figures.forEach((f, i) => {
    if (f.stock !== catalog.figures[i].stock) stock[f.id] = f.stock;
    if (f.editionSold !== catalog.figures[i].editionSold) editionSold[f.id] = f.editionSold;
  });
  return {
    users: db.users, unlocks: db.unlocks, progress: db.progress, cart: db.cart, orders: db.orders, tags: db.tags,
    ownership: db.ownership, settings: db.settings, events: db.events.slice(catalog.events.length),
    chapterOverrides, stock, editionSold,
  };
}

export async function read(): Promise<DB> {
  return compose(await loadState(), false);
}

export async function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const db = compose(await loadState(), true);
  const result = fn(db);
  await saveState(decompose(db));
  return result;
}

export async function resetState() {
  await saveState(clone(initialState));
}

export const id = (prefix = "") => prefix + crypto.randomBytes(6).toString("hex");
export const now = () => new Date().toISOString();
