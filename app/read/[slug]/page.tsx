import Link from "next/link";
import { notFound } from "next/navigation";
import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canRead, isChapterFree, publisherName } from "@/lib/catalog";
import { Cover } from "@/components/Art";
import ChapterList from "@/components/ChapterList";
import { LANGS, type Lang } from "@/lib/types";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const s = read().series.find((x) => x.slug === params.slug);
  return { title: s ? `Read ${s.title}` : "Not found" };
}

export default function SeriesRead({ params, searchParams }: { params: { slug: string }; searchParams: { lang?: string } }) {
  const db = read();
  const s = db.series.find((x) => x.slug === params.slug);
  if (!s) notFound();
  const user = currentUser();
  const prog = user ? db.progress.find((p) => p.userId === user.id && p.seriesId === s.id) : undefined;
  const lang: Lang = (s.languages.includes(searchParams.lang as Lang) ? searchParams.lang : prog?.language && s.languages.includes(prog.language) ? prog.language : "en") as Lang;
  const chs = db.chapters.filter((c) => c.seriesId === s.id).sort((a, b) => a.number - b.number);
  const rows = chs.map((c) => [c.number, c.volumeNumber, isChapterFree(db, c) ? 1 : 0, canRead(db, c, user) ? 1 : 0] as [number, number, number, number]);
  const lockedCount = rows.filter((r) => !r[3]).length;
  const startAt = prog ? prog.chapter : 1;

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div className="w-32 shrink-0"><Cover title={s.title} color={s.color} sub={publisherName(db, s.publisherId)} /></div>
        <div className="min-w-0 space-y-1.5">
          <h1 className="h-title">{s.title}</h1>
          <div className="text-sm text-muted">{s.author}</div>
          <div className="text-sm"><span className="font-semibold">{publisherName(db, s.publisherId)}</span> · {s.status === "ongoing" ? "Ongoing" : "Completed"} · since {s.startYear}</div>
          <div className="flex flex-wrap gap-1">{s.genres.map((g) => <span key={g} className="chip py-0.5">{g}</span>)}</div>
          <div className="text-xs text-muted">{s.totalChapters.toLocaleString("en-IN")} chapters · {s.totalVolumes} volumes</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{s.synopsis}</p>

      <div>
        <div className="label mb-1.5">Reading language</div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {LANGS.map((l) => {
            const ok = s.languages.includes(l.code);
            return ok ? (
              <Link key={l.code} href={`/read/${s.slug}?lang=${l.code}`} replace className={lang === l.code ? "chip-on" : "chip"}>{l.native}</Link>
            ) : (
              <span key={l.code} className="chip cursor-not-allowed opacity-45" title="Translation coming soon">{l.native} · soon</span>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/read/${s.slug}/${startAt}?lang=${lang}`} className="btn-primary flex-1">{prog ? `Continue · Ch. ${prog.chapter}` : "Start reading · Ch. 1"}</Link>
        <Link href={`/manga/${s.slug}`} data-section="manga" className="btn-ghost">Buy in print</Link>
      </div>
      {lockedCount > 0 && <div className="rounded-xl bg-accentsoft px-3 py-2 text-xs text-accent">{lockedCount.toLocaleString("en-IN")} chapters are ₹9 each. Unlocked chapters stay yours forever.</div>}

      <ChapterList slug={s.slug} lang={lang} rows={rows} readUpTo={prog?.chapter ?? 0} totalVolumes={s.totalVolumes} />
    </div>
  );
}
