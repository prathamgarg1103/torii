"use client";
import { gsap } from "gsap";
export { gsap };
export const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fly a small ink dot from an element to the cart icon, then bump the badge. */
export function flyToCart(from: Element | null) {
  const target = document.querySelector("[data-cart-icon]");
  if (!from || !target || reduced()) { target && gsap.fromTo(target, { scale: 1.25 }, { scale: 1, duration: 0.35 }); return; }
  const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
  const dot = document.createElement("div");
  dot.className = "pointer-events-none fixed z-[90] h-4 w-4 rounded-full border-2 border-[rgb(var(--ink))] bg-[rgb(var(--accent))]";
  document.body.appendChild(dot);
  const x0 = a.left + a.width / 2 - 8, y0 = a.top + a.height / 2 - 8, x1 = b.left + b.width / 2 - 8, y1 = b.top + b.height / 2 - 8;
  gsap.set(dot, { x: x0, y: y0, left: 0, top: 0 });
  const tl = gsap.timeline({ onComplete: () => dot.remove() });
  tl.to(dot, { x: x1, duration: 0.6, ease: "power1.inOut" }, 0)
    .to(dot, { y: Math.min(y0, y1) - 80, duration: 0.3, ease: "power2.out" }, 0)
    .to(dot, { y: y1, duration: 0.3, ease: "power2.in" }, 0.3)
    .to(dot, { scale: 0.4, duration: 0.15 }, 0.5)
    .fromTo(target, { scale: 1.35, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.45, ease: "back.out(3)" }, 0.6);
}
