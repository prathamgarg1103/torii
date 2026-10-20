"use client";
import { useEffect, useRef } from "react";
import { finePointer, gsap, reduced } from "@/lib/motion";

/** Covers lean a few degrees toward the cursor, with a soft sheen. Desktop only. */
export default function Tilt({ children, className = "", max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node || reduced() || !finePointer()) return;
    const inner = node.firstElementChild as HTMLElement | null; if (!inner) return;
    const sheen = document.createElement("span");
    sheen.className = "pointer-events-none absolute inset-0 z-10 rounded-[8px] opacity-0";
    node.appendChild(sheen);
    gsap.set(node, { transformPerspective: 700 });
    const rx = gsap.quickTo(node, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(node, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * max * 2); rx(-(py - 0.5) * max * 2);
      sheen.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgb(255 255 255 / .28), transparent 55%)`;
    };
    const enter = () => { gsap.to(node, { scale: 1.03, duration: 0.6, ease: "power3.out" }); gsap.to(sheen, { opacity: 1, duration: 0.4 }); };
    const leave = () => { rx(0); ry(0); gsap.to(node, { scale: 1, duration: 0.8, ease: "power3.out" }); gsap.to(sheen, { opacity: 0, duration: 0.5 }); };
    node.addEventListener("pointermove", move); node.addEventListener("pointerenter", enter); node.addEventListener("pointerleave", leave);
    return () => { node.removeEventListener("pointermove", move); node.removeEventListener("pointerenter", enter); node.removeEventListener("pointerleave", leave); sheen.remove(); };
  }, [max]);
  return <div ref={el} className={`relative will-change-transform [transform-style:preserve-3d] ${className}`}>{children}</div>;
}
