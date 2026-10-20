import Link from "next/link";
import { read } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { cartFor } from "@/lib/catalog";
import CartLines from "@/components/CartLines";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cart" };

export default async function Cart() {
  const user = await requireUser("/cart");
  const { lines, total, count } = cartFor((await read()), user.id);
  if (!lines.length) return (
    <div className="space-y-3 pt-10 text-center">
      <h1 className="h-title">Your cart is empty</h1>
      <p className="text-sm text-muted">Printed volumes and figures you add show up here.</p>
      <div className="flex justify-center gap-2"><Link href="/manga" data-section="manga" className="btn-primary">Shop manga</Link><Link href="/figures" data-section="figures" className="btn-primary">Shop figures</Link></div>
    </div>
  );
  return (
    <div className="space-y-4">
      <h1 className="h-title">Cart · {count} item{count > 1 ? "s" : ""}</h1>
      <CartLines lines={lines.map((l) => ({ id: l.id, kind: l.kind, qty: l.qty, title: l.info.title, subtitle: l.info.subtitle, price: l.info.price, color: l.info.color, href: l.info.href }))} />
      <div className="card space-y-1 p-4 text-sm">
        <div className="flex justify-between"><span className="text-muted">Items</span><span>{inr(total)}</span></div>
        <div className="flex justify-between"><span className="text-muted">Delivery</span><span className="text-ok">Free</span></div>
        <div className="flex justify-between pt-1 text-base font-extrabold"><span>Total</span><span>{inr(total)}</span></div>
      </div>
      <Link href="/checkout" className="btn-primary w-full">Checkout · {inr(total)}</Link>
    </div>
  );
}
