"use client";
import { useState } from "react";
import { IconCheck } from "./Icons";

type Purpose = "unlock" | "topup" | "order";
type CreateRes = { amount: number; description: string; mode: "mock" | "razorpay"; key?: string; orderId?: string; error?: string };
declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void } } }

function loadRazorpay(): Promise<boolean> {
  return new Promise((res) => {
    if (window.Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true); s.onerror = () => res(false);
    document.body.appendChild(s);
  });
}

export default function PayButton({ purpose, payload, className = "btn-primary w-full", children, onSuccess, disabled }:
  { purpose: Purpose; payload: Record<string, unknown>; className?: string; children: React.ReactNode; onSuccess: (r: Record<string, unknown>) => void; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sheet, setSheet] = useState<CreateRes | null>(null);

  async function complete(payment: Record<string, unknown>) {
    const r = await fetch("/api/pay/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ purpose, payload, payment }) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Payment could not be completed");
    return j;
  }

  async function start() {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/pay/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ purpose, payload }) });
      const j: CreateRes = await r.json();
      if (r.status === 401) { location.href = `/login?next=${encodeURIComponent(location.pathname + location.search)}`; return; }
      if (!r.ok) throw new Error(j.error || "Could not start payment");
      if (j.mode === "razorpay" && (await loadRazorpay()) && window.Razorpay) {
        const rz = new window.Razorpay({
          key: j.key, order_id: j.orderId, amount: j.amount * 100, currency: "INR", name: "Torii", description: j.description,
          method: { upi: true }, theme: { color: "#c8282b" },
          handler: async (resp: Record<string, string>) => {
            try { onSuccess(await complete({ mode: "razorpay", ...resp })); } catch (e) { setErr((e as Error).message); }
          },
          modal: { ondismiss: () => setBusy(false) },
        });
        rz.open();
      } else {
        setSheet(j);
      }
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  return (
    <>
      <button className={className} onClick={start} disabled={busy || disabled}>{busy && !sheet ? "Starting…" : children}</button>
      {err && <p className="mt-1 text-xs text-bad">{err}</p>}
      {sheet && (
        <MockUpiSheet amount={sheet.amount} description={sheet.description}
          onCancel={() => { setSheet(null); setBusy(false); }}
          onPaid={async () => {
            const res = await complete({ mode: "mock", ref: "MOCKUPI" + Date.now() });
            setTimeout(() => { setSheet(null); setBusy(false); onSuccess(res); }, 700);
          }} />
      )}
    </>
  );
}

const APPS = [
  { id: "gpay", name: "Google Pay", c: "#1a73e8" }, { id: "phonepe", name: "PhonePe", c: "#5f259f" },
  { id: "paytm", name: "Paytm", c: "#00b9f1" }, { id: "bhim", name: "BHIM", c: "#f07b20" },
];

function MockUpiSheet({ amount, description, onCancel, onPaid }: { amount: number; description: string; onCancel: () => void; onPaid: () => Promise<void> }) {
  const [app, setApp] = useState("gpay");
  const [vpa, setVpa] = useState("");
  const [stage, setStage] = useState<"choose" | "waiting" | "done" | "error">("choose");
  const [msg, setMsg] = useState("");
  async function pay() {
    if (app === "vpa" && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(vpa)) { setMsg("Enter a valid UPI ID, e.g. name@okaxis"); return; }
    setStage("waiting");
    await new Promise((r) => setTimeout(r, 1400));
    try { await onPaid(); setStage("done"); } catch (e) { setMsg((e as Error).message); setStage("error"); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" aria-label="UPI payment">
      <div className="w-full max-w-md rounded-t-3xl bg-card p-5 sm:rounded-3xl" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
        <div className="mb-1 flex items-center justify-between">
          <span className="label">Test checkout · no real money</span>
          {stage === "choose" && <button className="text-sm text-muted" onClick={onCancel}>Cancel</button>}
        </div>
        <div className="text-3xl font-extrabold">₹{amount.toLocaleString("en-IN")}</div>
        <div className="mb-4 text-sm text-muted">{description}</div>
        {stage === "choose" && (
          <>
            <div className="grid grid-cols-4 gap-2">
              {APPS.map((a) => (
                <button key={a.id} onClick={() => setApp(a.id)} className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-semibold ${app === a.id ? "border-accent bg-accentsoft" : "border-line"}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: a.c }}>{a.name[0]}</span>{a.name}
                </button>
              ))}
            </div>
            <button onClick={() => setApp("vpa")} className={`mt-2 w-full rounded-xl border px-3 py-2 text-left text-sm ${app === "vpa" ? "border-accent bg-accentsoft" : "border-line"}`}>Pay with UPI ID</button>
            {app === "vpa" && <input className="input mt-2" placeholder="yourname@okaxis" value={vpa} onChange={(e) => setVpa(e.target.value)} autoFocus />}
            {msg && <p className="mt-2 text-xs text-bad">{msg}</p>}
            <button className="btn-primary mt-4 w-full" onClick={pay}>Pay ₹{amount.toLocaleString("en-IN")}</button>
          </>
        )}
        {stage === "waiting" && (
          <div className="flex flex-col items-center gap-3 py-6 text-sm">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-accent" />
            Waiting for approval in {app === "vpa" ? "your UPI app" : APPS.find((a) => a.id === app)?.name}…
          </div>
        )}
        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-6 font-semibold text-ok">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ok text-white"><IconCheck className="h-7 w-7" /></span>Payment successful
          </div>
        )}
        {stage === "error" && (
          <div className="py-4 text-center text-sm"><p className="text-bad">{msg}</p><button className="btn-ghost mt-3" onClick={onCancel}>Close</button></div>
        )}
      </div>
    </div>
  );
}
