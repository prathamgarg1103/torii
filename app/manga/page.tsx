import Link from "next/link";
import { read } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { ownedVolumes, publisherName } from "@/lib/catalog";
import { Cover } from "@/components/Art";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buy manga" };

export default function MangaHome({ searchParams }: { searchParams: { pub?: string; q?: string } }) {
  const db = read();
  const user = currentUser();
  const q = (searchParams.q || "").toLowerCase();
  const list = db.series
    .filter((s) => (!searchParams.pub || s.publisherId === searchParams.pub) && (!q || s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q)))
    .sort((a, b) => b.popularity - a.popularity);
  const boxes = db.boxSets.filter((b) => b.title.includes("Complete")).slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-accent px-4 py-4 text-white">
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Printed in India · officially licensed</div>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight">Every series. Every volume. In order.</h1>
          <p className="mt-1 text-sm opacity-90">India-printed editions from ₹299 — each with a scannable authenticity tag.</p>
        </div>
      </section>

      <form className="flex gap-2" action="/manga">
        <input name="q" defaultValue={searchParams.q} className="input" placeholder="Search series or author" aria-label="Search" />
        {searchParams.pub && <input type="hidden" name="pub" value={searchParams.pub} />}
        <button className="btn-primary">Search</button>
      </form>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Link href="/manga" className={!searchParams.pub ? "chip-on" : "chip"}>All publishers</Link>
        {db.publishers.map((p) => <Link key={p.id} href={`/manga?pub=${p.id}`} className={searchParams.pub === p.id ? "chip-on" : "chip"}>{p.name}</Link>)}
      </div>

      {!searchParams.pub && !q && (
        <section>
          <h2 className="mb-2 font-bold">Complete box sets</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
            {boxes.map((b) => {
              const s = db.series.find((x) => x.id === b.seriesId)!;
              return (
                <Link key={b.id} href={`/manga/${s.slug}`} className="card w-60 shrink-0 p-3">
                  <div className="flex gap-1">{[0, 1, 2].map((i) => <div key={i} className="w-1/3"><Cover title={s.title} color={s.color} size="sm" sub={`Vol. ${i + 1}`} /></div>)}</div>
                  <div className="mt-2 text-sm font-bold">{b.title}</div>
                  <div className="text-xs text-muted">Vol. {b.fromVol}–{b.toVol} · <span className="font-semibold text-accent">{inr(b.price)}</span></div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-2">
        {list.map((s) => {
          const vols = db.volumes.filter((v) => v.seriesId === s.id);
          const minP = Math.min(...vols.map((v) => v.price));
          const owned = user ? ownedVolumes(db, user.id, s.id).size : 0;
          return (
            <Link key={s.id} href={`/manga/${s.slug}`} className="card flex gap-3 p-3">
              <div className="w-16 shrink-0"><Cover title={s.title} color={s.color} size="sm" /></div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{s.title}</div>
                <div className="text-xs text-muted">{s.author} · {publisherName(db, s.publisherId)}</div>
                <div className="mt-1 text-xs">{s.totalVolumes} volumes · from <span className="font-semibold text-accent">{inr(minP)}</span></div>
                {owned > 0 && (
                  <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-line"><div className="h-full bg-accent" style={{ width: `${(owned / s.totalVolumes) * 100}%` }} /></div>
                    You own {owned}/{s.totalVolumes}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
