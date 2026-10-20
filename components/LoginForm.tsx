"use client";
import { useState } from "react";
import { Torii } from "./Icons";

export default function LoginForm({ next }: { next: string }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(step === "phone" ? { phone } : { phone, otp }) });
    const j = await r.json(); setBusy(false);
    if (!r.ok) { setErr(j.error); return; }
    if (step === "phone") { setStep("otp"); return; }
    location.href = j.isAdmin && next === "/read" ? "/publisher" : next;
  }
  return (
    <div className="mx-auto max-w-sm">
      <section className="paper-band relative -mx-4 -mt-5 overflow-hidden border-b-2 border-ink px-4 pb-7 pt-8 text-center dark:border-line">
        <div className="tone pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-[rgb(230,0,51)] text-white shadow-panel"><Torii className="h-8 w-8" /></span>
          <h1 className="h-title mt-4">Sign in to Torii</h1>
          <p className="mt-1 text-[15px]">One account for reading, buying and your shelf.</p>
        </div>
      </section>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="label mb-1 block">Mobile number</span>
          <div className="flex gap-2">
            <span className="input flex w-[68px] items-center justify-center font-bold text-muted">+91</span>
            <input className="input text-[17px] font-semibold tracking-wide" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} disabled={step === "otp"} autoFocus />
          </div>
        </label>
        {step === "otp" && (
          <label className="block">
            <span className="label mb-1 block">Code sent to +91 {phone}</span>
            <input className="input text-center text-[22px] font-bold tracking-[.6em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoFocus />
            <span className="mt-1.5 block text-[13px] text-muted">This prototype doesn't send texts. Enter <b className="text-fg">123456</b>.</span>
          </label>
        )}
        {err && <p className="text-[14px] font-semibold text-bad">{err}</p>}
        <button className="btn-primary w-full text-[16px]" disabled={busy || phone.length !== 10 || (step === "otp" && otp.length !== 6)}>
          {busy ? "One moment…" : step === "phone" ? "Send OTP" : "Verify & continue"}
        </button>
        {step === "otp" && <button type="button" className="w-full text-[14px] font-semibold text-muted underline underline-offset-2" onClick={() => { setStep("phone"); setOtp(""); }}>Use a different number</button>}
      </form>
      <div className="mt-6 rounded-panel border-2 border-dashed border-line p-4 text-[13.5px] leading-relaxed text-muted">
        Trying the demo? Sign in as a fan with <b className="text-fg">9876543210</b> (₹50 in the wallet) or as the publisher with <b className="text-fg">9999999999</b>. Any other number makes a new account.
      </div>
    </div>
  );
}
