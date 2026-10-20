"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Cover } from "./Art";
import { IconSearch } from "./Icons";
import { LANGS, type Lang } from "@/lib/types";

type Item = { slug: string; title: string; author: string; publisher: string; genres: string[]; status: string; languages: Lang[]; popularity: number; chapters: number; color: string; startYear: number };

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

  const Row = ({ children }: { children: React.ReactNode }) => <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">{children}</div>;
  return (
    <section className="space-y-3">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input className="input pl-9" placeholder="Search title or author" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search manga" />
      </div>
      <Row>
        <button className={!pub ? "chip-on" : "chip"} onClick={() => setPub("")}>All publishers</button>
        {pubs.map((p) => <button key={p} className={pub === p ? "chip-on" : "chip"} onClick={() => setPub(pub === p ? "" : p)}>{p}</button>)}
      </Row>
      <Row>
        {LANGS.map((l) => <button key={l.code} className={lang === l.code ? "chip-on" : "chip"} onClick={() => setLang(lang === l.code ? "" : l.code)}>{l.native}</button>)}
        <span className="mx-1 w-px shrink-0 bg-line" />
        {["ongoing", "completed"].map((s) => <button key={s} className={status === s ? "chip-on" : "chip"} onClick={() => setStatus(status === s ? "" : s)}>{s === "ongoing" ? "Ongoing" : "Completed"}</button>)}
      </Row>
      <div className="flex gap-2">
        <select className="input" value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Genre">
          <option value="">All genres</option>{genres.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="popular">Most popular</option><option value="az">A–Z</option><option value="new">Newest series</option>
        </select>
      </div>
      <div className="text-xs text-muted">{list.length} series</div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {list.map((i) => (
          <Link key={i.slug} href={`/read/${i.slug}`} className="group">
            <Cover title={i.title} color={i.color} size="sm" sub={i.publisher} />
            <div className="mt-1.5 line-clamp-1 text-[13px] font-semibold">{i.title}</div>
            <div className="line-clamp-1 text-[11px] text-muted">{i.chapters.toLocaleString("en-IN")} ch · {i.status === "ongoing" ? "Ongoing" : "Completed"}</div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <div className="card p-6 text-center text-sm text-muted">No series match these filters.</div>}
    </section>
  );
}
