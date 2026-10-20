import Link from "next/link";
import RevealScope from "@/components/RevealScope";
import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { publisherName } from "@/lib/catalog";
import { Cover } from "@/components/Art";
import ReadCatalog from "@/components/ReadCatalog";
import ReadHero from "@/components/ReadHero";
import Tilt from "@/components/Tilt";
import { CHAPTER_PRICE, FREE_CHAPTERS_IN_PAID_MODE } from "@/lib/config";
import { LANGS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Read" };

export default async function ReadHome() {
  const db = await read();
  const user = await currentUser();
  const pub = (id: string) => publisherName(db, id);
  const since = Date.now() - 30 * 864e5;
  const reads = new Map<string, number>();
  for (const e of db.events) if (e.type === "read" && Date.parse(e.createdAt) > since) reads.set(e.seriesId, (reads.get(e.seriesId) ?? 0) + 1);
  const trending = [...db.series].sort((a, b) => (reads.get(b.id) ?? 0) - (reads.get(a.id) ?? 0)).slice(0, 10);
  const items = db.series.map((s) => ({
    slug: s.slug, title: s.title, author: s.author, publisher: pub(s.publisherId), genres: s.genres,
    status: s.status, languages: s.languages, popularity: s.popularity, chapters: s.totalChapters, color: s.color, startYear: s.startYear, image: s.image,
  }));
  const progress = user
    ? db.progress.filter((p) => p.userId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
        .map((p) => ({ p, s: db.series.find((s) => s.id === p.seriesId)! }))
    : [];
  const paid = db.settings.readingMode === "paid";
  const hero = trending.slice(0, 5).map((s) => ({
    slug: s.slug, title: s.title, author: s.author, publisher: pub(s.publisherId), color: s.color, synopsis: s.synopsis,
    langs: LANGS.filter((l) => s.languages.includes(l.code)).map((l) => l.native), chapters: s.totalChapters, image: s.image,
  }));

  return (
    <div className="space-y-9">
      <ReadHero items={hero} priceNote={paid ? `First ${FREE_CHAPTERS_IN_PAID_MODE} chapters free, then ₹${CHAPTER_PRICE} each` : "Every chapter is free during launch"} />

      {progress.length > 0 && (
        <section aria-labelledby="cont">
          <h2 id="cont" data-reveal="lines" className="h-section mb-3">Pick up where you left off</h2>
          <div data-reveal="stagger" className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {progress.map(({ p, s }) => (
              <Link key={s.id} href={`/read/${s.slug}/${p.chapter}?lang=${p.language}`} className="group w-[118px] shrink-0">
                <Cover title={s.title} color={s.color} image={s.image} size="sm" />
                <div className="mt-2 truncate text-[13.5px] font-bold">{s.title}</div>
                <div className="text-[12px] text-muted">Chapter {p.chapter}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(4, (p.chapter / s.totalChapters) * 100)}%` }} /></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="top">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="top" data-reveal="lines" className="h-section">Top 10 in India this month</h2>
          <span className="text-[12.5px] text-muted">by chapters read</span>
        </div>
        <ol data-reveal="stagger" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-3 pt-1">
          {trending.map((s, i) => (
            <li key={s.id} className="shrink-0">
              <Link href={`/read/${s.slug}`} className="flex items-end" aria-label={`Number ${i + 1}: ${s.title}`}>
                <span aria-hidden className="-mr-3.5 font-display text-[88px] leading-[.78] text-transparent [-webkit-text-stroke:1.5px_rgb(var(--fg)/.75)]">{i + 1}</span>
                <Tilt className="w-[96px]"><Cover title={s.title} color={s.color} image={s.image} size="sm" /></Tilt>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <ReadCatalog items={items} />
      <RevealScope />
    </div>
  );
}
