"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PayButton from "./PayButton";
import { IconBack, IconLock } from "./Icons";

export default function UnlockGate({ slug, title, chapter, chapterId, lang, price, signedIn, wallet, color }:
  { slug: string; title: string; chapter: number; chapterId: string; lang: string; price: number; signedIn: boolean; wallet: number; color: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const here = `/read/${slug}/${chapter}?lang=${lang}`;
  async function useWallet() {
    setBusy(true); setErr("");
    const r = await fetch("/api/wallet/unlock", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chapterId }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error || "Unlock failed"); setBusy(false); return; }
    router.refresh();
  }
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex h-12 max-w-3xl items-center gap-2 px-2">
        <Link href={`/read/${slug}?lang=${lang}`} className="p-2" aria-label="Back"><IconBack /></Link>
        <div className="truncate text-sm font-semibold">{title} · Chapter {chapter}</div>
      </div>
      <div className="mx-auto max-w-sm px-4 pt-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-white" style={{ background: color }}><IconLock className="h-9 w-9" /></div>
        <h1 className="text-2xl font-extrabold">Unlock Chapter {chapter}</h1>
        <p className="mt-1 text-sm text-muted">₹{price} once. It stays unlocked forever, in every language. Every rupee supports the official creators.</p>
        <div className="mt-6 space-y-2">
          {!signedIn ? (
            <Link href={`/login?next=${encodeURIComponent(here)}`} className="btn-primary w-full">Sign in to unlock</Link>
          ) : (
            <>
              {wallet >= price && <button className="btn-primary w-full" onClick={useWallet} disabled={busy}>{busy ? "Unlocking…" : `Unlock from wallet · ₹${price}`}</button>}
              <PayButton purpose="unlock" payload={{ chapterId }} className={wallet >= price ? "btn-ghost w-full" : "btn-primary w-full"} onSuccess={() => router.refresh()}>
                Pay ₹{price} with UPI
              </PayButton>
              <div className="pt-1 text-xs text-muted">Wallet balance: ₹{wallet.toLocaleString("en-IN")} · <Link href="/account" className="underline">Top up</Link></div>
            </>
          )}
          {err && <p className="text-xs text-bad">{err}</p>}
        </div>
      </div>
    </div>
  );
}
