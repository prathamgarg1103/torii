"use client";
import { useState } from "react";
import { Cover } from "./Art";
import AddToCart from "./AddToCart";

type V = { id: string; number: number; price: number; edition: string; stock: number; owned: boolean; inCart: boolean };
export default function VolumeGrid({ vols, title, color, signedIn }: { vols: V[]; title: string; color: string; signedIn: boolean }) {
  const [sel, setSel] = useState<V | null>(null);
  return (
    <section>
      <div className="mb-2 flex items-center gap-3 text-xs">
        <h2 className="mr-auto text-base font-bold">All volumes</h2>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-accent" /> Owned</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-line" /> Missing</span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {vols.map((v) => (
          <button key={v.id} onClick={() => setSel(v)} className={`relative rounded-xl p-0.5 text-left ${v.owned ? "ring-2 ring-accent" : ""}`} aria-label={`Volume ${v.number}`}>
            <Cover title={title} color={color} size="sm" sub={`Vol. ${v.number}`} dim={!v.owned} />
            <div className="mt-1 flex items-center justify-between px-0.5 text-[11px]">
              <span className={v.owned ? "font-bold text-accent" : v.stock === 0 ? "text-muted line-through" : "font-semibold"}>{v.owned ? "Owned" : `₹${v.price}`}</span>
              {v.edition === "import" && <span className="rounded bg-line px-1 text-[9px] font-bold">IMPORT</span>}
              {v.inCart && !v.owned && <span className="text-[9px] font-bold text-accent">IN CART</span>}
            </div>
          </button>
        ))}
      </div>
      {sel && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={() => setSel(null)}>
          <div className="w-full max-w-md rounded-t-3xl bg-card p-5" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
            <div className="flex gap-4">
              <div className="w-24"><Cover title={title} color={color} size="sm" sub={`Vol. ${sel.number}`} /></div>
              <div className="space-y-1 text-sm">
                <div className="text-lg font-extrabold">{title} Vol. {sel.number}</div>
                <div className="text-muted">{sel.edition === "india" ? "India-printed edition · ships in 2–6 days" : "Imported edition · not yet printed in India"}</div>
                <div className="text-xl font-extrabold text-accent">₹{sel.price.toLocaleString("en-IN")}</div>
                <div className="text-xs">{sel.owned ? "Already on your shelf" : sel.stock === 0 ? "Out of stock" : sel.stock < 25 ? `Only ${sel.stock} left` : "In stock"}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <AddToCart kind="volume" refId={sel.id} signedIn={signedIn} className="btn-primary flex-1" disabled={sel.stock === 0} label={sel.owned ? "Buy another copy" : "Add to cart"} />
              <button className="btn-ghost" onClick={() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
