"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, reduced } from "@/lib/motion";
import { Cover } from "./Art";

gsap.registerPlugin(useGSAP);
type Item = { slug: string; title: string; author: string; publisher: string; color: string; synopsis: string; langs: string[]; chapters: number; image?: string };

export default function ReadHero({ items, priceNote }: { items: Item[]; priceNote: string }) {
  const [i, setI] = useState(0);
  const root = useRef<HTMLElement>(null);
  const touch = useRef(0);
  const it = items[i];

  // The one orchestrated moment: speed lines burst, the jacket drops into place, the title sets.
  useGSAP(() => {
    if (reduced()) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from("[data-burst] path", { scaleY: 0, transformOrigin: "50% 100%", opacity: 0, duration: 0.5, stagger: { each: 0.012, from: "center" } })
      .from("[data-jacket]", { y: 60, rotate: 8, opacity: 0, duration: 0.7, ease: "back.out(1.4)" }, 0.1)
      .from("[data-word]", { yPercent: 110, duration: 0.55, stagger: 0.06 }, 0.3)
      .from("[data-fade]", { opacity: 0, y: 12, duration: 0.4, stagger: 0.06 }, 0.55);
  }, { scope: root });

  const go = (n: number) => {
    const next = (n + items.length) % items.length;
    if (reduced() || !root.current) { setI(next); return; }
    const dir = n > i ? 1 : -1;
    gsap.to(root.current.querySelectorAll("[data-jacket], [data-copy]"), {
      x: -40 * dir, opacity: 0, duration: 0.18, ease: "power2.in",
      onComplete: () => {
        setI(next);
        requestAnimationFrame(() => gsap.fromTo(root.current!.querySelectorAll("[data-jacket], [data-copy]"), { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power3.out", stagger: 0.05 }));
      },
    });
  };

  return (
    <section ref={root} aria-roledescription="carousel" aria-label="Featured series"
      className="paper-band relative -mx-4 -mt-5 overflow-hidden border-b-2 border-ink px-4 pb-6 pt-6 dark:border-line"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); }}>
      <div className="tone pointer-events-none absolute inset-0 opacity-60" />
      <svg data-burst aria-hidden viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full text-ink/[.07] dark:text-white/[.05]">
        {Array.from({ length: 36 }, (_, k) => { const a = (k / 36) * Math.PI * 2; const q = (n: number) => Math.round(n); return <path key={k} d={`M100 170 L${q(100 + Math.cos(a - 0.03) * 600)} ${q(170 + Math.sin(a - 0.03) * 600)} L${q(100 + Math.cos(a + 0.03) * 600)} ${q(170 + Math.sin(a + 0.03) * 600)}Z`} fill="currentColor" />; })}
      </svg>

      <div className="relative grid grid-cols-[42%_1fr] items-center gap-5 sm:grid-cols-[220px_1fr]">
        <Link href={`/read/${it.slug}`} data-jacket className="block -rotate-[4deg] transition-transform hover:rotate-0" aria-label={`Open ${it.title}`}>
          <Cover title={it.title} color={it.color} image={it.image} sub={it.publisher} size="lg" />
        </Link>
        <div data-copy className="min-w-0">
          <p data-fade className="mb-1 text-[13px] font-bold text-accent">#{i + 1} in India</p>
          <h1 className="font-display text-[clamp(28px,8.5vw,46px)] leading-[0.98]">
            {it.title.replace(/:.*/, "").split(" ").map((w, k) => (
              <span key={k} className="inline-block overflow-hidden pb-1 align-bottom"><span data-word className="inline-block">{w}&nbsp;</span></span>
            ))}
          </h1>
          <p data-fade className="mt-1 text-[14px] font-semibold text-muted">{it.author}</p>
          <p data-fade className="mt-2 line-clamp-3 text-[14.5px] leading-snug">{it.synopsis}</p>
          <div data-fade className="mt-4 flex flex-wrap items-center gap-2">
            <Link href={`/read/${it.slug}/1`} className="btn-primary">Read chapter 1</Link>
            <Link href={`/read/${it.slug}`} className="btn-ghost">Details</Link>
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-3">
        <p data-fade className="text-[13px] font-semibold">{priceNote}</p>
        <div className="ml-auto flex items-center gap-1.5" role="tablist" aria-label="Choose featured series">
          {items.map((x, k) => (
            <button key={x.slug} role="tab" aria-selected={k === i} aria-label={x.title} onClick={() => go(k)}
              className={`h-2.5 rounded-full border-2 border-ink transition-all dark:border-line ${k === i ? "w-7 bg-ink dark:bg-fg" : "w-2.5 bg-card"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
