"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cover, FigureArt } from "./Art";

type L = { id: string; kind: string; qty: number; title: string; subtitle: string; price: number; color: string; href: string };
export default function CartLines({ lines }: { lines: L[] }) {
  const router = useRouter();
  const set = async (id: string, qty: number) => {
    await fetch("/api/cart", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, qty }) });
    router.refresh();
  };
  return (
    <div className="space-y-2">
      {lines.map((l) => (
        <div key={l.id} className="card flex gap-3 p-3">
          <Link href={l.href} className="w-14 shrink-0">{l.kind === "figure" ? <FigureArt color={l.color} /> : <Cover title={l.title} color={l.color} size="sm" />}</Link>
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-sm font-semibold">{l.title}</div>
            <div className="truncate text-xs text-muted">{l.subtitle}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-bold">₹{(l.price * l.qty).toLocaleString("en-IN")}</span>
              <div className="ml-auto flex items-center rounded-lg border border-line">
                <button className="px-2.5 py-1" onClick={() => set(l.id, l.qty - 1)} aria-label="Decrease">−</button>
                <span className="w-6 text-center text-sm">{l.qty}</span>
                <button className="px-2.5 py-1" onClick={() => set(l.id, l.qty + 1)} aria-label="Increase" disabled={l.kind === "box" && l.qty >= 3}>+</button>
              </div>
              <button className="text-xs text-muted underline" onClick={() => set(l.id, 0)}>Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
