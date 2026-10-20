import { mutate, read, now } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canRead, } from "@/lib/catalog";
import { logRead } from "@/lib/payments";
import { body, fail, ok } from "@/lib/api";
import type { Lang } from "@/lib/types";

export async function POST(req: Request) {
  const { slug, chapter, language } = await body<{ slug: string; chapter: number; language: Lang }>(req);
  const db0 = await read();
  const s = db0.series.find((x) => x.slug === slug);
  const ch = s && db0.chapters.find((c) => c.seriesId === s.id && c.number === Number(chapter));
  if (!s || !ch) return fail("Not found", 404);
  const user = await currentUser();
  if (!canRead(db0, ch, user)) return fail("Locked", 403);
  const lang: Lang = s.languages.includes(language) ? language : "en";
  await mutate((db) => {
    logRead(db, user?.id ?? null, s.id, lang);
    if (!user) return;
    const p = db.progress.find((x) => x.userId === user.id && x.seriesId === s.id);
    if (p) { p.chapter = ch.number; p.language = lang; p.updatedAt = now(); }
    else db.progress.push({ userId: user.id, seriesId: s.id, chapter: ch.number, language: lang, updatedAt: now() });
  });
  return ok();
}
