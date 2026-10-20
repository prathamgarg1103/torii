"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { settleGrid } from "@/lib/motion";
import { Cover } from "./Art";
import Tilt from "./Tilt";
import { IconSearch } from "./Icons";
import { LANGS, type Lang } from "@/lib/types";

type Item = { slug: string; title: string; author: string; publisher: string; genres: string[]; status: string; languages: Lang[]; popularity: number; chapters: number; color: string; startYear: number; image?: string };

export default function ReadCatalog({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const [pub, setPub] = useState("");
  const [genre, setGenre] = useState("");
  const [lang, setLang] = useState<Lang | "">("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("popular");
  const pubs = useMemo(() => Array.from(new Set(items.map((i) => i.publisher))), [items]);
  const genres = useMemo(() => Array.from(new Set(items.flatMap((i) => i.genres))).sort(), [items]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = items.filter((i) =>
      (!t || i.title.toLowerCase().includes(t) || i.author.toLowerCase().includes(t)) &&
      (!pub || i.publisher === pub) && (!genre || i.genres.includes(genre)) && (!lang || i.languages.includes(lang)) && (!status || i.status === status));
    return r.sort((a, b) => sort === "az" ? a.title.localeCompare(b.title) : sort === "new" ? b.startYear - a.startYear : b.popularity - a.popularity);
  }, [items, q, pub, genre, lang, status, sort]);
  const active = [pub, genre, lang, status].filter(Boolean).length;
  const grid = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } settleGrid(grid.current); }, [list]);

  return (
    <section aria-labelledby="all" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 id="all" data-reveal="lines" className="h-section">Every series</h2>
        <span className="text-[12.5px] text-muted">{list.length} series</span>
      </div>
      <div className="sticky top-[58px] z-20 -mx-4 space-y-2.5 border-b border-line bg-bg/92 px-4 pb-3 pt-2 backdrop-blur">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input className="input pl-10" placeholder="Search by title or author" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search manga" />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {LANGS.map((l) => <button key={l.code} aria-pressed={lang === l.code} className={lang === l.code ? "chip-on" : "chip"} onClick={() => setLang(lang === l.code ? "" : l.code)}>{l.native}</button>)}
          <span className="w-px shrink-0 bg-line" />
          {pubs.map((p) => <button key={p} aria-pressed={pub === p} className={pub === p ? "chip-on" : "chip"} onClick={() => setPub(pub === p ? "" : p)}>{p}</button>)}
        </div>
        <div className="flex gap-2">
          <select className="input min-h-[40px] py-1.5 text-[14px]" value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Genre">
            <option value="">Any genre</option>{genres.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select className="input min-h-[40px] py-1.5 text-[14px]" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="">Ongoing and completed</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
          </select>
          <select className="input min-h-[40px] w-auto py-1.5 text-[14px]" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="popular">Popular</option><option value="az">A to Z</option><option value="new">Newest</option>
          </select>
        </div>
      </div>
      <div ref={grid} data-reveal="stagger" className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
        {list.map((i) => (
          <Link key={i.slug} href={`/read/${i.slug}`} className="group">
            <Tilt><Cover title={i.title} color={i.color} image={i.image} size="sm" sub={i.publisher} /></Tilt>
            <div className="mt-2.5 line-clamp-2 text-[13.5px] font-semibold leading-tight transition-colors duration-300 group-hover:text-accent">{i.title}</div>
            <div className="mt-0.5 text-[12px] text-muted">{i.chapters.toLocaleString("en-IN")} chapters</div>
          </Link>
        ))}
      </div>
      {list.length === 0 && (
        <div className="panel p-6 text-center">
          <p className="font-bold">Nothing matches those filters.</p>
          {active > 0 && <button className="btn-ghost mt-3" onClick={() => { setPub(""); setGenre(""); setLang(""); setStatus(""); setQ(""); }}>Clear filters</button>}
        </div>
      )}
    </section>
  );
}
