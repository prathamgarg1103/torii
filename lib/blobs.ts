import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { redis, storageMode } from "./db";

/**
 * Uploaded artwork and manga pages. Each file is stored on its own, outside the state document:
 * in Upstash Redis (key torii:blob:<id>) when Redis is configured, otherwise in data/uploads/.
 * In production this would be S3 or R2 behind a CDN with signed URLs.
 */
export type BlobKind = "cover" | "banner" | "page";
export interface BlobMeta { kind: BlobKind; orgId: string; ct: string; size: number; createdAt: string }

const DIR = path.join(process.cwd(), "data", "uploads");
const ID = /^m_[a-f0-9]{20}$/;

/** Works out the image type from the file's first bytes, never from what the browser claims. */
export function sniffImage(b: Buffer): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function putBlob(data: Buffer, meta: Omit<BlobMeta, "size" | "createdAt">): Promise<string> {
  const id = "m_" + crypto.randomBytes(10).toString("hex");
  const full: BlobMeta = { ...meta, size: data.length, createdAt: new Date().toISOString() };
  if (storageMode() === "redis") {
    await redis(["SET", `torii:blob:${id}`, JSON.stringify({ meta: full, b64: data.toString("base64") })]);
    await redis(["SET", `torii:blobmeta:${id}`, JSON.stringify(full)]);
  } else {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(path.join(DIR, `${id}.bin`), data);
    fs.writeFileSync(path.join(DIR, `${id}.json`), JSON.stringify(full));
  }
  return id;
}

export async function getBlob(id: string): Promise<{ data: Buffer; meta: BlobMeta } | null> {
  if (!ID.test(id)) return null;
  if (storageMode() === "redis") {
    const { result } = await redis(["GET", `torii:blob:${id}`]);
    if (typeof result !== "string") return null;
    const j = JSON.parse(result) as { meta: BlobMeta; b64: string };
    return { data: Buffer.from(j.b64, "base64"), meta: j.meta };
  }
  const bin = path.join(DIR, `${id}.bin`), js = path.join(DIR, `${id}.json`);
  if (!fs.existsSync(bin) || !fs.existsSync(js)) return null;
  return { data: fs.readFileSync(bin), meta: JSON.parse(fs.readFileSync(js, "utf8")) };
}

/** Metadata only (owner, kind) for many blobs at once, without loading the images. */
export async function blobMetas(ids: string[]): Promise<(BlobMeta | null)[]> {
  if (!ids.length) return [];
  if (storageMode() === "redis") {
    const valid = ids.map((i) => ID.test(i));
    const keys = ids.filter((_, k) => valid[k]).map((i) => `torii:blobmeta:${i}`);
    const { result } = keys.length ? await redis(["MGET", ...keys]) : { result: [] };
    const vals = (result as (string | null)[]) ?? [];
    let j = 0;
    return ids.map((_, k) => { if (!valid[k]) return null; const v = vals[j++]; return typeof v === "string" ? (JSON.parse(v) as BlobMeta) : null; });
  }
  return ids.map((i) => {
    if (!ID.test(i)) return null;
    const js = path.join(DIR, `${i}.json`);
    return fs.existsSync(js) ? (JSON.parse(fs.readFileSync(js, "utf8")) as BlobMeta) : null;
  });
}

export function blobResponse(b: { data: Buffer; meta: BlobMeta }, cache: string) {
  return new Response(new Uint8Array(b.data), {
    headers: { "content-type": b.meta.ct, "content-length": String(b.data.length), "cache-control": cache, "x-content-type-options": "nosniff" },
  });
}
