"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { finePointer, gsap, reduced, ScrollTrigger } from "@/lib/motion";

/** Smooth scrolling on desktop. Phones keep native scrolling. */
export default function MotionProvider() {
  useEffect(() => {
    if (reduced() || !finePointer()) return;
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, prevent: (node: HTMLElement) => !!node.closest?.(".no-scrollbar, [role=dialog]") });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  return null;
}
