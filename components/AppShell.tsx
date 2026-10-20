"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, SECTIONS, type SectionKey } from "@/lib/config";
import { IconBook, IconCart, IconFigure, IconScan, IconShelf, IconStack, IconUser, Torii } from "./Icons";

export function sectionFor(path: string): SectionKey {
  if (path.startsWith("/read")) return "read";
  if (path.startsWith("/manga")) return "manga";
  if (path.startsWith("/figures")) return "figures";
  if (path.startsWith("/account") || path.startsWith("/publisher") || path.startsWith("/login")) return "account";
  return "shelf"; // shelf, verify, cart, checkout, orders: shared across sections
}

const NAV: { href: string; key: SectionKey; label: string; Icon: (p: { className?: string }) => JSX.Element }[] = [
  { href: "/read", key: "read", label: "Read", Icon: IconBook },
  { href: "/manga", key: "manga", label: "Manga", Icon: IconStack },
  { href: "/figures", key: "figures", label: "Figures", Icon: IconFigure },
  { href: "/shelf", key: "shelf", label: "Shelf", Icon: IconShelf },
  { href: "/account", key: "account", label: "Account", Icon: IconUser },
];

export default function AppShell({ children, signedIn, cartCount, wallet }: { children: React.ReactNode; signedIn: boolean; cartCount: number; wallet: number }) {
  const path = usePathname() || "/";
  const section = sectionFor(path);
  const isReader = /^\/read\/[^/]+\/\d+/.test(path);
  if (isReader) return <div data-section="read">{children}</div>;
  const isPublisher = path.startsWith("/publisher");
  const sectionLabel = path.startsWith("/cart") || path.startsWith("/checkout") ? "Cart" : path.startsWith("/orders") ? "Orders" : path.startsWith("/verify") ? "Verify" : isPublisher ? "Publisher" : SECTIONS[section].label;

  return (
    <div data-section={section} className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className={`mx-auto flex h-14 items-center gap-2 px-4 ${isPublisher ? "max-w-6xl" : "max-w-3xl"}`}>
          <Link href="/read" className="flex items-center gap-1.5 text-[rgb(200,40,43)]" aria-label={`${APP_NAME} home`}>
            <Torii className="h-6 w-6" />
            <span className="text-lg font-extrabold tracking-tight text-fg">{APP_NAME}</span>
          </Link>
          <span className="ml-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">{sectionLabel}</span>
          <div className="ml-auto flex items-center gap-1">
            {signedIn && (
              <Link href="/account" className="mr-1 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-semibold" title="Wallet">
                ₹{wallet.toLocaleString("en-IN")}
              </Link>
            )}
            <Link href="/verify" className="rounded-full p-2 hover:bg-card" aria-label="Verify authenticity"><IconScan /></Link>
            <Link href="/cart" className="relative rounded-full p-2 hover:bg-card" aria-label="Cart">
              <IconCart />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[rgb(200,40,43)] px-1 text-[10px] font-bold text-white">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <main className={`mx-auto px-4 pb-28 pt-4 ${isPublisher ? "max-w-6xl" : "max-w-3xl"}`}>{children}</main>
      {!isPublisher && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="mx-auto grid max-w-3xl grid-cols-5">
            {NAV.map(({ href, key, label, Icon }) => {
              const on = section === key && !path.startsWith("/cart") && !path.startsWith("/checkout") && !path.startsWith("/orders") && !path.startsWith("/verify");
              return (
                <Link key={key} href={href} data-section={key} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${on ? "text-accent" : "text-muted"}`}>
                  <Icon className="h-5 w-5" />
                  {label}
                  <span className={`mt-0.5 h-1 w-6 rounded-full ${on ? "bg-accent" : "bg-transparent"}`} />
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
