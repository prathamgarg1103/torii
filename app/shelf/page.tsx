import Link from "next/link";
import { read } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ownedVolumes } from "@/lib/catalog";
import { Cover, FigureArt } from "@/components/Art";
import { LANGS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Shelf" };

function rangeText(owned: number[]) {
  if (!owned.length) return "no volumes";
  const sorted = [...owned].sort((a, b) => a - b);
  const contiguous = sorted.every((n, i) => n === sorted[0] + i);
  if (contiguous) return sorted.length === 1 ? `volume ${sorted[0]}` : `volumes ${sorted[0]}–${sorted[sorted.length - 1]}`;
  return `${sorted.length} volumes`;
}

export default function Shelf() {
  const user = requireUser("/shelf");
  const db = read();
  const progress = db.progress.filter((p) => p.userId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const unlocks = db.unlocks.filter((u) => u.userId === user.id);
  const ownedVolIds = new Set(db.ownership.filter((o) => o.userId === user.id && o.kind === "volume").map((o) => o.refId));
  const seriesWithVols = db.series.filter((s) => db.volumes.some((v) => v.seriesId === s.id && ownedVolIds.has(v.id)));
  const figs = db.ownership.filter((o) => o.userId === user.id && o.kind === "figure").map((o) => ({ o, f: db.figures.find((f) => f.id === o.refId)! })).filter((x) => x.f);

  const gaps = progress.map((p) => {
    const s = db.series.find((x) => x.id === p.seriesId)!;
    const ch = db.chapters.find((c) => c.seriesId === s.id && c.number === p.chapter);
    const readVol = ch?.volumeNumber || s.totalVolumes;
    const owned = Array.from(ownedVolumes(db, user.id, s.id));
    const missing = Array.from({ length: readVol }, (_, i) => i + 1).filter((n) => !owned.includes(n));
    return { s, p, readVol, owned, missing };
  }).filter((g) => g.missing.length > 0);

  const stats = [
    ["Series reading", progress.length], ["Chapters unlocked", unlocks.length], ["Volumes owned", ownedVolIds.size], ["Figures owned", figs.length],
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="h-title">My Shelf</h1>
      <div className="grid grid-cols-4 gap-2">
        {stats.map(([l, n]) => <div key={l} className="card p-2.5 text-center"><div className="text-xl font-extrabold text-accent">{n}</div><div className="text-[10px] leading-tight text-muted">{l}</div></div>)}
      </div>

      {gaps.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold">Gaps in your collection</h2>
          {gaps.map((g) => (
            <div key={g.s.id} className="card flex items-center gap-3 p-3">
              <div className="w-12 shrink-0"><Cover title={g.s.title} color={g.s.color} size="sm" /></div>
              <div className="flex-1 text-sm">
                <div className="font-semibold">{g.s.title}</div>
                <div className="text-muted">You've read up to chapter {g.p.chapter} but own {rangeText(g.owned)}.</div>
                <div className="text-xs text-accent">{g.missing.length === 1 ? `Volume ${g.missing[0]} covers` : `Volumes ${g.missing.length > 6 ? `${g.missing.slice(0, 5).join(", ")}… (${g.missing.length} in all)` : g.missing.join(", ")} cover`} what you've read.</div>
              </div>
              <Link href={`/manga/${g.s.slug}`} data-section="manga" className="btn-primary px-3 py-2 text-xs">Fill gaps</Link>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 className="mb-2 font-bold">Reading</h2>
        {!progress.length && <div className="card p-4 text-sm text-muted">Start a series in <Link href="/read" className="underline">Read</Link> and your progress shows up here.</div>}
        <div className="space-y-2">
          {progress.map((p) => {
            const s = db.series.find((x) => x.id === p.seriesId)!;
            const un = unlocks.filter((u) => u.chapterId.startsWith(`c_${s.slug}_`)).length;
            return (
              <Link key={s.id} href={`/read/${s.slug}/${p.chapter}?lang=${p.language}`} data-section="read" className="card flex items-center gap-3 p-3">
                <div className="w-10 shrink-0"><Cover title={s.title} color={s.color} size="sm" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-muted">Chapter {p.chapter} of {s.totalChapters.toLocaleString("en-IN")} · {LANGS.find((l) => l.code === p.language)?.native}{un ? ` · ${un} unlocked` : ""}</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded bg-line"><div className="h-full bg-accent" style={{ width: `${Math.max(2, (p.chapter / s.totalChapters) * 100)}%` }} /></div>
                </div>
                <span className="text-xs font-semibold text-accent">Continue</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-bold">Printed volumes</h2>
        {!seriesWithVols.length && <div className="card p-4 text-sm text-muted">Volumes you buy or verify appear here.</div>}
        <div className="space-y-2">
          {seriesWithVols.map((s) => {
            const owned = ownedVolumes(db, user.id, s.id);
            return (
              <Link key={s.id} href={`/manga/${s.slug}`} data-section="manga" className="card block p-3">
                <div className="flex justify-between text-sm"><span className="font-semibold">{s.title}</span><span className="text-muted">{owned.size}/{s.totalVolumes}</span></div>
                <div className="mt-2 flex flex-wrap gap-[3px]">
                  {Array.from({ length: s.totalVolumes }, (_, i) => (
                    <span key={i} title={`Vol. ${i + 1}`} className={`h-5 w-2.5 rounded-sm ${owned.has(i + 1) ? "bg-accent" : "bg-line"}`} />
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-bold">Figures</h2>
        {!figs.length && <div className="card p-4 text-sm text-muted">Figures you buy or verify appear here.</div>}
        <div className="grid grid-cols-3 gap-2">
          {figs.map(({ f, o }) => {
            const tag = db.tags.find((t) => t.ownerId === user.id && t.refId === f.id);
            return (
              <Link key={f.id} href={`/figures/${f.slug}`} data-section="figures" className="card overflow-hidden">
                <FigureArt color={f.color} />
                <div className="p-2 text-[11px]"><div className="line-clamp-2 font-semibold">{f.name}</div>
                  <div className="text-ok">{tag ? "✓ Verified" : o.source === "order" ? "Ordered" : "Owned"}{tag?.editionNo ? ` · #${String(tag.editionNo).padStart(4, "0")}` : ""}</div></div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
