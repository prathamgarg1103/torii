import Link from "next/link";
import { read } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate, inr } from "@/lib/format";
export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };
export default async function Orders() {
  const user = await requireUser("/orders");
  const orders = (await read()).orders.filter((o) => o.userId === user.id).reverse();
  return (
    <div className="space-y-3">
      <h1 className="h-title">Your orders</h1>
      {!orders.length && <div className="card p-6 text-center text-sm text-muted">No orders yet.</div>}
      {orders.map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`} className="card block p-4">
          <div className="flex justify-between text-sm"><span className="font-bold">#{o.id}</span><span className="text-ok">{o.status}</span></div>
          <div className="mt-1 line-clamp-1 text-sm">{o.items.map((i) => i.title).join(", ")}</div>
          <div className="mt-1 flex justify-between text-xs text-muted"><span>{fmtDate(o.createdAt)} · arrives {o.eta}</span><span className="font-semibold text-fg">{inr(o.total)}</span></div>
        </Link>
      ))}
    </div>
  );
}
