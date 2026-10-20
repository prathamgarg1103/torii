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
    <div className="mx-auto max-w-sm pt-6">
      <div className="mb-6 text-center">
        <Torii className="mx-auto h-12 w-12 text-[rgb(200,40,43)]" />
        <h1 className="mt-2 text-2xl font-extrabold">Sign in to Torii</h1>
        <p className="text-sm text-muted">One account for reading, shopping and your shelf.</p>
      </div>
      <form onSubmit={submit} className="card space-y-3 p-4">
        <label className="block">
          <span className="label">Mobile number</span>
          <div className="mt-1 flex gap-2">
            <span className="input w-16 text-center text-muted">+91</span>
            <input className="input" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} disabled={step === "otp"} autoFocus />
          </div>
        </label>
        {step === "otp" && (
          <label className="block">
            <span className="label">OTP sent to +91 {phone}</span>
            <input className="input mt-1 text-center text-lg tracking-[.5em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoFocus />
            <span className="mt-1 block text-xs text-muted">Prototype: SMS is simulated — enter <b>123456</b>.</span>
          </label>
        )}
        {err && <p className="text-sm text-bad">{err}</p>}
        <button className="btn-primary w-full" disabled={busy || phone.length !== 10 || (step === "otp" && otp.length !== 6)}>
          {busy ? "Please wait…" : step === "phone" ? "Send OTP" : "Verify & continue"}
        </button>
        {step === "otp" && <button type="button" className="w-full text-xs text-muted underline" onClick={() => { setStep("phone"); setOtp(""); }}>Change number</button>}
      </form>
      <div className="mt-4 rounded-xl border border-dashed border-line p-3 text-xs text-muted">
        Demo accounts: fan <b>9876543210</b> (₹50 wallet) · publisher admin <b>9999999999</b>. Any other valid number creates a new account.
      </div>
    </div>
  );
}
