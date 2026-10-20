"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { APP_NAME, SECTIONS, type SectionKey } from "@/lib/config";
import { gsap, reduced } from "@/lib/motion";
import { IconBook, IconCart, IconFigure, IconScan, IconShelf, IconStack, IconUser, Torii } from "./Icons";

export function sectionFor(path: string): SectionKey {
  if (path.startsWith("/read")) return "read";
  if (path.startsWith("/manga")) return "manga";
  if (path.startsWith("/figures")) return "figures";
  if (path.startsWith("/account") || path.startsWith("/publisher") || path.startsWith("/login")) return "account";
  return "shelf";
}

const NAV: { href: string; key: SectionKey; label: string; Icon: (p: { className?: string }) => JSX.Element }[] = [
  { href: "/read", key: "read", label: "Read", Icon: IconBook },
  { href: "/manga", key: "manga", label: "Manga", Icon: IconStack },
  { href: "/figures", key: "figures", label: "Figures", Icon: IconFigure },
  { href: "/shelf", key: "shelf", label: "Shelf", Icon: IconShelf },
  { href: "/account", key: "account", label: "You", Icon: IconUser },
];
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function AppShell({ children, signedIn, cartCount, wallet }: { children: React.ReactNode; signedIn: boolean; cartCount: number; wallet: number }) {
  const path = usePathname() || "/";
  const section = sectionFor(path);
  const isReader = /^\/read\/[^/]+\/\d+/.test(path);
  const isPublisher = path.startsWith("/publisher");
  const navRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(cartCount);
  const shared = path.startsWith("/cart") || path.startsWith("/checkout") || path.startsWith("/orders") || path.startsWith("/verify");
  const activeKey = shared ? null : section;
  const tag = path.startsWith("/cart") || path.startsWith("/checkout") ? "Cart" : path.startsWith("/orders") ? "Orders" : path.startsWith("/verify") ? "Verify" : isPublisher ? "Publisher" : SECTIONS[section].label;

  // Slide the nav highlight to the active section.
  useIso(() => {
    const nav = navRef.current, pill = pillRef.current;
    if (!nav || !pill) return;
    const el = nav.querySelector<HTMLElement>(`[data-key="${activeKey}"]`);
    if (!el) { gsap.to(pill, { opacity: 0, duration: 0.2 }); return; }
    const x = el.offsetLeft, w = el.offsetWidth;
    if (reduced() || pill.dataset.ready !== "1") { gsap.set(pill, { x, width: w, opacity: 1 }); pill.dataset.ready = "1"; return; }
    gsap.to(pill, { x, width: w, opacity: 1, duration: 0.45, ease: "back.out(1.6)" });
  }, [activeKey]);

  useEffect(() => {
    if (cartCount > prevCount.current && !reduced()) gsap.fromTo("[data-cart-badge]", { scale: 0.2 }, { scale: 1, duration: 0.5, ease: "back.out(4)" });
    prevCount.current = cartCount;
  }, [cartCount]);

  if (isReader) return <div data-section="read">{children}</div>;
  const width = isPublisher ? "max-w-6xl" : "max-w-3xl";

  return (
    <div data-section={section} className="min-h-screen">
      <header className="paper-band sticky top-0 z-30 border-b-2 border-ink/90 dark:border-line" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className={`mx-auto flex h-[58px] items-center gap-2.5 px-4 ${width}`}>
          <Link href="/read" className="flex items-center gap-2 text-fg" aria-label={`${APP_NAME} home`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border-2 border-ink bg-[rgb(230,0,51)] text-white shadow-panel-sm dark:border-line"><Torii className="h-5 w-5" /></span>
            <span className="font-display text-[20px] leading-none">{APP_NAME}</span>
          </Link>
          <span className="rounded-md border-2 border-ink bg-card px-2 py-0.5 text-[12.5px] font-extrabold text-fg dark:border-line" aria-label={`Section: ${tag}`}>{tag}</span>
          <div className="ml-auto flex items-center gap-1">
            {signedIn && (
              <Link href="/account" className="mr-1 hidden rounded-full border-2 border-ink/80 bg-card px-3 py-1 text-[13px] font-bold sm:block dark:border-line" title="Wallet balance">
                Wallet ₹{wallet.toLocaleString("en-IN")}
              </Link>
            )}
            <Link href="/verify" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-card/70" aria-label="Verify a product"><IconScan /></Link>
            <Link href="/cart" data-cart-icon className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-card/70" aria-label={`Cart, ${cartCount} items`}>
              <IconCart />
              {cartCount > 0 && <span data-cart-badge className="absolute right-0.5 top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-ink bg-[rgb(230,0,51)] px-1 text-[10.5px] font-extrabold text-white">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>
      <main className={`mx-auto px-4 pb-32 pt-5 ${width}`}>{children}</main>
      {!isPublisher && (
        <nav className="fixed inset-x-0 bottom-0 z-30 px-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }} aria-label="Sections">
          <div ref={navRef} className="relative mx-auto grid max-w-md grid-cols-5 rounded-[20px] border-2 border-ink bg-ink p-1.5 shadow-lift dark:border-line dark:bg-card">
            <span ref={pillRef} aria-hidden className="absolute left-0 top-1.5 h-[calc(100%-12px)] rounded-[14px] bg-[rgb(var(--paper))] opacity-0" />
            {NAV.map(({ href, key, label, Icon }) => {
              const on = activeKey === key;
              return (
                <Link key={key} href={href} data-key={key} data-section={key} aria-current={on ? "page" : undefined}
                  className={`relative z-10 flex flex-col items-center gap-0.5 rounded-[14px] py-1.5 text-[11.5px] font-bold transition-colors ${on ? "text-fg" : "text-white/65 hover:text-white"}`}>
                  <Icon className="h-[22px] w-[22px]" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
