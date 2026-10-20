import Link from "next/link";
import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { publisherName } from "@/lib/catalog";
import { Cover } from "@/components/Art";
import ReadCatalog from "@/components/ReadCatalog";
import { CHAPTER_PRICE, FREE_CHAPTERS_IN_PAID_MODE } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Read" };

export default function ReadHome() {
  const db = read();
  const user = currentUser();
  const items = db.series.map((s) => ({
    slug: s.slug, title: s.title, author: s.author, publisher: publisherName(db, s.publisherId), genres: s.genres,
    status: s.status, languages: s.languages, popularity: s.popularity, chapters: s.totalChapters, color: s.color, startYear: s.startYear,
  }));
  const progress = user
    ? db.progress.filter((p) => p.userId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)
        .map((p) => ({ p, s: db.series.find((s) => s.id === p.seriesId)! }))
    : [];
  const paid = db.settings.readingMode === "paid";

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-accent px-4 py-4 text-white">
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Official · every publisher · one app</div>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight">Read official manga in your language</h1>
          <p className="mt-1 text-sm opacity-90">Shueisha, Kodansha, Shogakukan and Square Enix — together, in English, हिन्दी, தமிழ், తెలుగు and বাংলা.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 text-sm">
          {paid ? (
            <><span className="chip-on">₹{CHAPTER_PRICE} per chapter</span><span className="text-muted">First {FREE_CHAPTERS_IN_PAID_MODE} chapters of every series are free.</span></>
          ) : (
            <><span className="chip-on">Launch offer</span><span className="text-muted">Every chapter is free to read right now.</span></>
          )}
        </div>
      </section>

      {progress.length > 0 && (
        <section>
          <h2 className="mb-2 font-bold">Continue reading</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
            {progress.map(({ p, s }) => (
              <Link key={s.id} href={`/read/${s.slug}/${p.chapter}?lang=${p.language}`} className="w-28 shrink-0">
                <Cover title={s.title} color={s.color} size="sm" sub={`Ch. ${p.chapter}`} />
                <div className="mt-1 truncate text-xs font-semibold">{s.title}</div>
                <div className="h-1 overflow-hidden rounded bg-line"><div className="h-full bg-accent" style={{ width: `${Math.max(3, (p.chapter / s.totalChapters) * 100)}%` }} /></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ReadCatalog items={items} />
    </div>
  );
}
