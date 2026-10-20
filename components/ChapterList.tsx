"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IconLock, IconCheck } from "./Icons";

type Row = [number, number, number, number]; // number, volume, free, canRead
export default function ChapterList({ slug, lang, rows, readUpTo, totalVolumes }: { slug: string; lang: string; rows: Row[]; readUpTo: number; totalVolumes: number }) {
  const [desc, setDesc] = useState(false);
  const [jump, setJump] = useState("");
  const groups = useMemo(() => {
    const m = new Map<number, Row[]>();
    for (const r of rows) { const k = r[1]; if (!m.has(k)) m.set(k, []); m.get(k)!.push(r); }
    const arr = Array.from(m.entries()).sort((a, b) => (a[0] === 0 ? 1e9 : a[0]) - (b[0] === 0 ? 1e9 : b[0]));
    return desc ? arr.reverse().map(([k, v]) => [k, [...v].reverse()] as [number, Row[]]) : arr;
  }, [rows, desc]);
  const currentVol = rows.find((r) => r[0] === Math.max(1, readUpTo))?.[1] ?? 1;
  const [open, setOpen] = useState<Set<number>>(() => new Set([currentVol]));
  const toggle = (v: number) => setOpen((o) => { const n = new Set(o); n.has(v) ? n.delete(v) : n.add(v); return n; });

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-bold">Chapters</h2>
        <form className="ml-auto flex gap-1" onSubmit={(e) => { e.preventDefault(); const n = parseInt(jump, 10); if (n >= 1 && n <= rows.length) location.href = `/read/${slug}/${n}?lang=${lang}`; }}>
          <input className="input w-24 py-1.5" inputMode="numeric" placeholder="Go to ch." value={jump} onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))} aria-label="Jump to chapter" />
        </form>
        <button className="chip" onClick={() => setDesc(!desc)}>{desc ? "Newest first" : "Oldest first"}</button>
      </div>
      <div className="space-y-2">
        {groups.map(([vol, list]) => {
          const isOpen = open.has(vol);
          const first = Math.min(...list.map((r) => r[0])), last = Math.max(...list.map((r) => r[0]));
          return (
            <div key={vol} className="card overflow-hidden">
              <button className="flex w-full items-center gap-2 px-3 py-2.5 text-left" onClick={() => toggle(vol)} aria-expanded={isOpen}>
                <span className="font-semibold">{vol === 0 ? "Not yet in a volume" : `Volume ${vol}`}</span>
                <span className="text-xs text-muted">Ch. {first}–{last}</span>
                {vol !== 0 && vol <= totalVolumes && last <= readUpTo && <span className="text-ok"><IconCheck className="h-4 w-4" /></span>}
                <span className="ml-auto text-muted">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <ul className="divide-y divide-line border-t border-line">
                  {list.map(([n, , free, ok]) => (
                    <li key={n}>
                      <Link href={`/read/${slug}/${n}?lang=${lang}`} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                        <span className={n <= readUpTo ? "text-muted" : "font-medium"}>Chapter {n}</span>
                        {n === readUpTo && <span className="chip-on py-0.5">Last read</span>}
                        <span className="ml-auto flex items-center gap-1 text-xs">
                          {free ? <span className="text-ok">Free</span> : ok ? <span className="text-ok">Unlocked</span> : <span className="flex items-center gap-1 text-accent"><IconLock className="h-3.5 w-3.5" />₹9</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
