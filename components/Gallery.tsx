"use client";
import { useRef, useState } from "react";
import { FigureArt } from "./Art";
import { gsap, reduced } from "@/lib/motion";

const VIEWS = [["Front", 0], ["Turned", 1], ["In the box", 2]] as const;
export default function Gallery({ color, name }: { color: string; name: string }) {
  const [v, setV] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const pick = (n: number) => {
    if (n === v) return;
    if (reduced() || !stage.current) { setV(n); return; }
    gsap.to(stage.current, { rotateY: n > v ? -70 : 70, opacity: 0, duration: 0.16, ease: "power2.in", onComplete: () => {
      setV(n); gsap.fromTo(stage.current, { rotateY: n > v ? 70 : -70, opacity: 0 }, { rotateY: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)" });
    } });
  };
  return (
    <div className="-mx-4 -mt-5 border-b-2 border-ink paper-band px-4 pb-4 pt-5 dark:border-line" style={{ perspective: 900 }}>
      <div ref={stage} className="mx-auto max-w-sm overflow-hidden rounded-panel border-2 border-ink shadow-panel dark:border-line dark:shadow-none">
        <FigureArt color={color} name={name} variant={VIEWS[v][1]} rounded={false} />
      </div>
      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Views">
        {VIEWS.map(([l], i) => <button key={l} role="tab" aria-selected={v === i} onClick={() => pick(i)} className={v === i ? "chip-on" : "chip"}>{l}</button>)}
      </div>
    </div>
  );
}
