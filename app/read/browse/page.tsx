import RevealScope from "@/components/RevealScope";
import { read } from "@/lib/db";
import { publisherName } from "@/lib/catalog";
import ReadCatalog from "@/components/ReadCatalog";
import { ROWS, rowItems } from "@/lib/rows";
import type { Lang } from "@/lib/types";

export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }: { searchParams: { row?: string } }) {
  const r = ROWS.find((x) => x.key === searchParams.row);
  return { title: r ? r.title : "Browse" };
}

export default async function Browse({ searchParams }: { searchParams: { row?: string; genre?: string; demo?: string; lang?: string; q?: string } }) {
  const db = await read();
  const row = ROWS.find((x) => x.key === searchParams.row);
  const base = row ? rowItems(db.series, row) : db.series;
  const items = base.map((s) => ({
    slug: s.slug, title: s.title, author: s.author, publisher: publisherName(db, s.publisherId), genres: s.genres, demographic: s.demographic ?? "",
    status: s.status, languages: s.languages, popularity: s.popularity, chapters: s.totalChapters, color: s.color, startYear: s.startYear, image: s.image, score: s.score ?? 0,
  }));
  return (
    <div className="space-y-5">
      <section className="paper-band bleed relative -mt-5 overflow-hidden px-4 pb-5 pt-6">
        <div className="tone pointer-events-none absolute -inset-y-12 inset-x-0 opacity-60" />
        <div className="relative">
          <h1 className="font-display text-[clamp(28px,8cqw,40px)] leading-[1]">{row ? row.title : "Every series"}</h1>
          <p className="mt-2 text-[14.5px]">{items.length} series{row ? "" : " from every publisher, in one place"}.</p>
        </div>
      </section>
      <ReadCatalog items={items} initial={{ genre: searchParams.genre, demo: searchParams.demo, lang: searchParams.lang as Lang | undefined, q: searchParams.q }} keepOrder={!!row} />
      <RevealScope />
    </div>
  );
}
