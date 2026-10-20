"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconShield, IconScan } from "./Icons";
import type { VerifyResult } from "@/app/api/verify/route";

export default function Verify({ initialCode, signedIn }: { initialCode: string; signedIn: boolean }) {
  const [code, setCode] = useState(initialCode);
  const [res, setRes] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [camErr, setCamErr] = useState("");
  const scanner = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const ran = useRef(false);

  const check = useCallback(async (c: string) => {
    if (!c.trim()) return;
    setBusy(true); setRes(null);
    const r = await fetch("/api/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: c }) });
    setRes(await r.json()); setBusy(false);
  }, []);

  useEffect(() => { if (initialCode && !ran.current) { ran.current = true; check(initialCode); } }, [initialCode, check]);

  const stopScan = useCallback(async () => {
    try { await scanner.current?.stop(); scanner.current?.clear(); } catch {}
    scanner.current = null; setScanning(false);
  }, []);
  useEffect(() => () => { stopScan(); }, [stopScan]);

  async function startScan() {
    setCamErr(""); setRes(null); setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode("qr-reader");
      scanner.current = s as unknown as { stop: () => Promise<void>; clear: () => void };
      await s.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, (text) => {
        setCode(text); stopScan(); check(text);
      }, () => {});
    } catch {
      setCamErr("Camera unavailable. Allow camera access, or type the code below.");
      setScanning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <IconShield className="mx-auto h-10 w-10 text-accent" />
        <h1 className="h-title mt-1">Is it genuine?</h1>
        <p className="text-sm text-muted">Scan the Torii code on any volume or figure box.</p>
      </div>
      <div className={`overflow-hidden rounded-2xl bg-black ${scanning ? "" : "hidden"}`}><div id="qr-reader" className="w-full" /></div>
      {scanning
        ? <button className="btn-ghost w-full" onClick={stopScan}>Stop camera</button>
        : <button className="btn-primary w-full" onClick={startScan}><IconScan /> Scan QR code</button>}
      {camErr && <p className="text-center text-xs text-bad">{camErr}</p>}
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); check(code); }}>
        <input className="input font-mono uppercase" placeholder="T1-XXXXXXXX-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Authenticity code" />
        <button className="btn-ghost" disabled={busy}>{busy ? "…" : "Check"}</button>
      </form>

      {res?.state === "genuine" && (
        <div className="card overflow-hidden">
          <div className="bg-ok px-4 py-3 font-extrabold text-white">✓ Genuine official product</div>
          <div className="space-y-1 p-4 text-sm">
            <div className="text-base font-bold">{res.title}{res.editionNo ? ` · #${String(res.editionNo).padStart(4, "0")}` : ""}</div>
            <div className="text-muted">Licensed by {res.licensor}{res.manufacturer ? ` · made by ${res.manufacturer}` : ""}</div>
            {res.mine && <div className="pt-1 font-semibold text-ok">Registered to you and added to <Link href="/shelf" className="underline">My Shelf</Link>.</div>}
            {res.needsLogin && <div className="pt-1">Not yet registered. <Link href={`/login?next=${encodeURIComponent(`/verify?code=${code}`)}`} className="font-semibold underline">Sign in</Link> to claim it as yours.</div>}
            <Link href={res.href} className="inline-block pt-1 text-accent underline">View product</Link>
          </div>
        </div>
      )}
      {res?.state === "claimed" && (
        <div className="card overflow-hidden">
          <div className="bg-warn px-4 py-3 font-extrabold text-white">⚠ Genuine code — already registered</div>
          <div className="space-y-1 p-4 text-sm">
            <div className="text-base font-bold">{res.title}</div>
            <div>This code was first registered in <b>{res.city}</b> on <b>{res.when}</b> by another owner.</div>
            <div className="text-muted">If you just bought this new, it's likely a copy using a cloned tag. Don't pay for it — the official one is in the store.</div>
            <Link href={res.href} className="inline-block pt-1 text-accent underline">Buy the official product</Link>
          </div>
        </div>
      )}
      {res?.state === "invalid" && (
        <div className="card overflow-hidden">
          <div className="bg-bad px-4 py-3 font-extrabold text-white">✕ Not an official product</div>
          <div className="p-4 text-sm">The code <span className="font-mono">{res.code || "(empty)"}</span> wasn't issued by Torii. Official codes are signed and can't be guessed.</div>
        </div>
      )}
      {!signedIn && !res && <p className="text-center text-xs text-muted">You can check codes without signing in. Sign in to register items to your shelf.</p>}
    </div>
  );
}
