"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddToCart({ kind, refId, items, label = "Add to cart", className = "btn-primary", signedIn, disabled }:
  { kind?: "volume" | "box" | "figure"; refId?: string; items?: { kind: string; refId: string }[]; label?: string; className?: string; signedIn: boolean; disabled?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");
  async function add() {
    if (!signedIn) { location.href = `/login?next=${encodeURIComponent(location.pathname + location.search)}`; return; }
    setState("busy"); setErr("");
    const r = await fetch("/api/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(items ? { items } : { kind, refId }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error || "Could not add"); setState("idle"); return; }
    setState("done"); router.refresh();
    setTimeout(() => setState("idle"), 1600);
  }
  return (
    <span className="contents">
      <button className={className} onClick={add} disabled={disabled || state === "busy"}>{state === "done" ? "Added ✓" : state === "busy" ? "Adding…" : label}</button>
      {err && <span className="block text-xs text-bad">{err}</span>}
    </span>
  );
}
