"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FigureArt } from "./Art";
import { IconSearch } from "./Icons";

type F = { slug: string; name: string; series: string; character: string; manufacturer: string; price: number; scale: string; availability: string; color: string; left: number | null; releaseMonth: string | null; stock: number };
const BANDS = [["", "Any price"], ["lo", "Under ₹999"], ["mid", "₹1,000–₹2,999"], ["hi", "₹3,000+"]] as const;
const AVAIL: Record<string, string> = { in_stock: "In stock", preorder: "Pre-order", limited: "Limited edition" };

export default function FigureCatalog({ items }: { items: F[] }) {
  const [q, setQ] = useState(""); const [series, setSeries] = useState(""); const [maker, setMaker] = useState("");
  const [band, setBand] = useState(""); const [scale, setScale] = useState(""); const [avail, setAvail] = useState("");
  const uniq = (k: keyof F) => Array.from(new Set(items.map((i) => String(i[k])))).sort();
  const list = useMemo(() => items.filter((i) => {
    const t = q.trim().toLowerCase();
    const inBand = !band || (band === "lo" ? i.price < 1000 : band === "mid" ? i.price >= 1000 && i.price < 3000 : i.price >= 3000);
    return (!t || i.name.toLowerCase().includes(t) || i.character.toLowerCase().includes(t)) && (!series || i.series === series) &&
      (!maker || i.manufacturer === maker) && inBand && (!scale || i.scale === scale) && (!avail || i.availability === avail);
  }), [items, q, series, maker, band, scale, avail]);

  return (
    <section className="space-y-3">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input className="input pl-9" placeholder="Search character or figure" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search figures" />
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {BANDS.map(([k, l]) => <button key={k} className={band === k ? "chip-on" : "chip"} onClick={() => setBand(k)}>{l}</button>)}
        <span className="mx-1 w-px shrink-0 bg-line" />
        {Object.entries(AVAIL).map(([k, l]) => <button key={k} className={avail === k ? "chip-on" : "chip"} onClick={() => setAvail(avail === k ? "" : k)}>{l}</button>)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <select className="input" value={series} onChange={(e) => setSeries(e.target.value)} aria-label="Series"><option value="">All series</option>{uniq("series").map((x) => <option key={x}>{x}</option>)}</select>
        <select className="input" value={maker} onChange={(e) => setMaker(e.target.value)} aria-label="Brand"><option value="">All brands</option>{uniq("manufacturer").map((x) => <option key={x}>{x}</option>)}</select>
        <select className="input" value={scale} onChange={(e) => setScale(e.target.value)} aria-label="Scale"><option value="">Any scale</option>{uniq("scale").map((x) => <option key={x}>{x}</option>)}</select>
      </div>
      <div className="text-xs text-muted">{list.length} figures</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((f) => (
          <Link key={f.slug} href={`/figures/${f.slug}`} className="card overflow-hidden">
            <div className="relative"><FigureArt color={f.color} />
              {f.availability !== "in_stock" && <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">{f.availability === "limited" ? `Limited · ${f.left} left` : `Pre-order · ${f.releaseMonth}`}</span>}
            </div>
            <div className="p-2.5">
              <div className="line-clamp-2 text-[13px] font-semibold leading-snug">{f.name}</div>
              <div className="mt-0.5 truncate text-[11px] text-muted">{f.series} · {f.manufacturer}</div>
              <div className="mt-1 font-extrabold text-accent">₹{f.price.toLocaleString("en-IN")}</div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <div className="card p-6 text-center text-sm text-muted">No figures match these filters.</div>}
    </section>
  );
}
