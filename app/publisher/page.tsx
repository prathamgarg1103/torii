import Link from "next/link";
import { read } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { publisherName } from "@/lib/catalog";
import Dashboard from "@/components/Dashboard";
import AdminControls from "@/components/AdminControls";
import { LANGS, type Lang } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publisher dashboard" };

const LOCAL: Record<string, Lang> = { "Tamil Nadu": "ta", Telangana: "te", "Andhra Pradesh": "te", "West Bengal": "bn", Assam: "bn" };

export default async function Publisher({ searchParams }: { searchParams: { pub?: string } }) {
  await requireAdmin();
  const db = await read();
  const pub = searchParams.pub || "";
  const seriesIds = new Set(db.series.filter((s) => !pub || s.publisherId === pub).map((s) => s.id));
  const ev = db.events.filter((e) => seriesIds.has(e.seriesId));
  const sum = (t: string) => ev.filter((e) => e.type === t).reduce((a, e) => a + e.amount, 0);
  const cnt = (t: string) => ev.filter((e) => e.type === t).length;
  const kpis = {
    reads: cnt("read"), unlocks: cnt("unlock"), unlockRev: sum("unlock"), prints: cnt("print"), printRev: sum("print"),
    figures: cnt("figure"), figureRev: sum("figure"), revenue: sum("unlock") + sum("print") + sum("figure"),
  };
  const bySeries = db.series.filter((s) => seriesIds.has(s.id)).map((s) => {
    const e = ev.filter((x) => x.seriesId === s.id);
    return { name: s.title.length > 16 ? s.title.slice(0, 15) + "…" : s.title, reads: e.filter((x) => x.type === "read").length,
      sales: e.filter((x) => x.type !== "read").reduce((a, x) => a + x.amount, 0) };
  });
  const byLang = LANGS.map((l) => ({ name: l.name, reads: ev.filter((e) => e.type === "read" && e.language === l.code).length,
    paid: ev.filter((e) => e.type === "unlock" && e.language === l.code).length }));
  const stateMap = new Map<string, { reads: number; revenue: number }>();
  for (const e of ev) {
    if (e.state === "Unknown") continue;
    const m = stateMap.get(e.state) ?? { reads: 0, revenue: 0 };
    if (e.type === "read") m.reads++; else m.revenue += e.amount;
    stateMap.set(e.state, m);
  }
  const byState = Array.from(stateMap, ([name, v]) => ({ name, ...v })).sort((a, b) => b.reads - a.reads).slice(0, 12);
  const cityMap = new Map<string, number>();
  for (const e of ev) if (e.city !== "Unknown") cityMap.set(`${e.city}, ${e.state}`, (cityMap.get(`${e.city}, ${e.state}`) ?? 0) + 1);
  const topCities = Array.from(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const weeks: Record<string, number> = {};
  for (const e of ev) {
    if (e.type === "read") continue;
    const d = new Date(e.createdAt); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - d.getDay());
    const k = d.toISOString().slice(0, 10); weeks[k] = (weeks[k] ?? 0) + e.amount;
  }
  const trend = Object.entries(weeks).sort().slice(-13).map(([k, v]) => ({ week: new Date(k).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), revenue: v }));

  // Audience discovery: regional demand for series that don't yet have the local language.
  const opp: { series: string; lang: string; state: string; reads: number }[] = [];
  for (const s of db.series.filter((x) => seriesIds.has(x.id))) {
    for (const [state, lang] of Object.entries(LOCAL)) {
      if (s.languages.includes(lang)) continue;
      const reads = ev.filter((e) => e.seriesId === s.id && e.state === state && e.type === "read").length;
      if (reads) opp.push({ series: s.title, lang: LANGS.find((l) => l.code === lang)!.name, state, reads });
    }
  }
  const merged = new Map<string, { series: string; lang: string; states: string[]; reads: number }>();
  for (const o of opp) {
    const k = o.series + o.lang; const m = merged.get(k) ?? { series: o.series, lang: o.lang, states: [], reads: 0 };
    m.states.push(o.state); m.reads += o.reads; merged.set(k, m);
  }
  const opportunities = Array.from(merged.values()).sort((a, b) => b.reads - a.reads).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <div className="label">Publisher dashboard, last 90 days</div>
          <h1 className="h-title mt-1">What India is reading and buying</h1>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Link href="/publisher" className={!pub ? "chip-on" : "chip"}>All publishers</Link>
          {db.publishers.map((p) => <Link key={p.id} href={`/publisher?pub=${p.id}`} className={pub === p.id ? "chip-on" : "chip"}>{p.name}</Link>)}
        </div>
      </div>
      <AdminControls mode={db.settings.readingMode} slugs={db.series.map((s) => ({ slug: s.slug, title: s.title }))}
        overrides={db.chapters.filter((c) => c.freeOverride !== null).slice(0, 20).map((c) => ({ title: db.series.find((s) => s.id === c.seriesId)!.title, slug: db.series.find((s) => s.id === c.seriesId)!.slug, number: c.number, free: c.freeOverride! }))} />
      <Dashboard kpis={kpis} bySeries={bySeries} byLang={byLang} byState={byState} trend={trend} topCities={topCities} opportunities={opportunities}
        scope={pub ? publisherName(db, pub) : "All publishers"} />
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/publisher/tags" className="btn-ghost">Demo authenticity codes</Link>
        <Link href="/read" className="btn-ghost">Open the fan app</Link>
      </div>
    </div>
  );
}
