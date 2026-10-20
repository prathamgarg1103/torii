import Link from "next/link";
import { notFound } from "next/navigation";
import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canRead, isChapterFree, publisherName } from "@/lib/catalog";
import { Cover } from "@/components/Art";
import ChapterList from "@/components/ChapterList";
import { LANGS, type Lang } from "@/lib/types";
import { CHAPTER_PRICE } from "@/lib/config";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const s = (await read()).series.find((x) => x.slug === params.slug);
  return { title: s ? `Read ${s.title}` : "Not found" };
}

export default async function SeriesRead({ params, searchParams }: { params: { slug: string }; searchParams: { lang?: string } }) {
  const db = await read();
  const s = db.series.find((x) => x.slug === params.slug);
  if (!s) notFound();
  const user = await currentUser();
  const prog = user ? db.progress.find((p) => p.userId === user.id && p.seriesId === s.id) : undefined;
  const lang: Lang = (s.languages.includes(searchParams.lang as Lang) ? searchParams.lang : prog?.language && s.languages.includes(prog.language) ? prog.language : "en") as Lang;
  const chs = db.chapters.filter((c) => c.seriesId === s.id).sort((a, b) => a.number - b.number);
  const rows = chs.map((c) => [c.number, c.volumeNumber, isChapterFree(db, c) ? 1 : 0, canRead(db, c, user) ? 1 : 0] as [number, number, number, number]);
  const lockedCount = rows.filter((r) => !r[3]).length;
  const startAt = prog ? prog.chapter : 1;
  const pub = publisherName(db, s.publisherId);

  return (
    <div className="space-y-7">
      <section className="paper-band relative -mx-4 -mt-5 overflow-hidden border-b-2 border-ink px-4 pb-6 pt-6 dark:border-line">
        <div className="tone pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex gap-5">
          <div className="w-[38%] max-w-[170px] shrink-0 -rotate-2"><Cover title={s.title} color={s.color} image={s.image} sub={pub} size="lg" /></div>
          <div className="min-w-0 self-end">
            <h1 className="font-display text-[clamp(26px,7.5vw,40px)] leading-[1]">{s.title}</h1>
            <p className="mt-2 text-[14.5px] font-semibold">{s.author}</p>
            <p className="text-[13.5px] text-muted">{pub}, since {s.startYear}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-md border-2 border-ink bg-card px-2 py-0.5 text-[12px] font-bold dark:border-line">{s.status === "ongoing" ? "Ongoing" : "Completed"}</span>
              {s.genres.map((g) => <span key={g} className="rounded-md bg-card/70 px-2 py-0.5 text-[12px] font-semibold">{g}</span>)}
            </div>
          </div>
        </div>
        <p className="relative mt-5 max-w-prose text-[15px] leading-relaxed">{s.synopsis}</p>
        <div className="relative mt-5 grid grid-cols-[1fr_auto] gap-2">
          <Link href={`/read/${s.slug}/${startAt}?lang=${lang}`} className="btn-primary text-[16px]">{prog ? `Continue chapter ${prog.chapter}` : "Start with chapter 1"}</Link>
          <Link href={`/manga/${s.slug}`} className="btn-ghost">Buy the books</Link>
        </div>
      </section>

      <section aria-labelledby="lang">
        <h2 id="lang" className="label mb-2">Read in</h2>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {LANGS.map((l) => s.languages.includes(l.code) ? (
            <Link key={l.code} href={`/read/${s.slug}?lang=${l.code}`} replace aria-current={lang === l.code ? "true" : undefined} className={lang === l.code ? "chip-on" : "chip"}>{l.native}</Link>
          ) : (
            <span key={l.code} className="chip cursor-not-allowed border-dashed text-muted" title="Translation in progress">{l.native}, coming soon</span>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[[s.totalChapters.toLocaleString("en-IN"), "chapters"], [String(s.totalVolumes), "printed volumes"], [lockedCount ? `₹${CHAPTER_PRICE}` : "Free", lockedCount ? "per paid chapter" : "to read now"]].map(([n, l]) => (
          <div key={l} className="card py-3"><div className="price text-[22px] leading-none">{n}</div><div className="mt-1 text-[12px] text-muted">{l}</div></div>
        ))}
      </div>

      <ChapterList slug={s.slug} lang={lang} rows={rows} readUpTo={prog?.chapter ?? 0} totalVolumes={s.totalVolumes} />
    </div>
  );
}
