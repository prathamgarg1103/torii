"use client";
import Link from "next/link";
import { useState } from "react";

export default function PartnerLogin({ next, demo }: { next: string; demo: boolean }) {
  const [email, setEmail] = useState(demo ? "partner@shueisha.example" : "");
  const [password, setPassword] = useState(demo ? "torii-demo" : "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch("/api/partner/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setBusy(false); setErr(j.error || "Couldn't sign in"); return; }
    location.href = next;
  }
  const fill = (who: "shueisha" | "kodansha") => { setEmail(`partner@${who}.example`); setPassword("torii-demo"); };
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_.9fr] md:py-20">
      <div>
        <div className="jp text-[13px] tracking-[.1em] text-accent">パートナーログイン</div>
        <h1 className="mt-2 font-display text-[clamp(30px,4vw,44px)] leading-[1.05]">Sign in to the Partner Portal</h1>
        <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-muted">For publishers and rights holders. Readers sign in to the Torii app with their phone instead.</p>
        <form onSubmit={submit} className="mt-8 max-w-md space-y-4">
          <label className="block"><span className="field-label">Work email <span className="jp font-normal text-muted">メールアドレス</span></span>
            <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></label>
          <label className="block"><span className="field-label">Password <span className="jp font-normal text-muted">パスワード</span></span>
            <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {err && <p role="alert" className="text-[14px] font-semibold text-bad">{err}</p>}
          <button className="btn-primary w-full text-[16px]" disabled={busy || !email || !password}>{busy ? "Signing in…" : "Sign in"}</button>
          <p className="text-[14px] text-muted">New to Torii? <Link href="/partner/apply" className="font-semibold text-fg underline underline-offset-2">Join the partner programme</Link></p>
        </form>
      </div>
      <aside className="panel self-start p-6">
        <div className="label">Demo accounts</div>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">Both use the password <b className="text-fg">torii-demo</b>. Shueisha and Kodansha already have series on Torii, so their insights and earnings are filled in.</p>
        <div className="mt-4 grid gap-2">
          <button type="button" onClick={() => fill("shueisha")} className="btn-ghost justify-between"><span>Shueisha <span className="jp text-muted">集英社</span></span><span className="text-[12.5px] text-muted">Fill in</span></button>
          <button type="button" onClick={() => fill("kodansha")} className="btn-ghost justify-between"><span>Kodansha <span className="jp text-muted">講談社</span></span><span className="text-[12.5px] text-muted">Fill in</span></button>
        </div>
        <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">Torii staff approve titles in the reader app: sign in with phone <b className="text-fg">9999999999</b> (OTP 123456), then open <Link href="/publisher/review" className="font-semibold text-fg underline underline-offset-2">Review queue</Link>.</p>
      </aside>
    </div>
  );
}
