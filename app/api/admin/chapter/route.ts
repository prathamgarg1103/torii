import { mutate, read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { body, fail, ok } from "@/lib/api";
// Per-chapter override: free = true (always free), false (always paid), null (follow reading mode).
export async function POST(req: Request) {
  if (!(await currentUser())?.isAdmin) return fail("Publisher access only", 403);
  const { slug, number, free } = await body<{ slug: string; number: number; free: boolean | null }>(req);
  const s = (await read()).series.find((x) => x.slug === slug);
  if (!s) return fail("Series not found", 404);
  const res = await mutate((db) => {
    const ch = db.chapters.find((c) => c.seriesId === s.id && c.number === Number(number));
    if (!ch) return null;
    ch.freeOverride = free === null ? null : !!free;
    return { title: s.title, number: ch.number, freeOverride: ch.freeOverride };
  });
  return res ? ok(res) : fail("Chapter not found", 404);
}
