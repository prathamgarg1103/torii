import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { read } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate, inr } from "@/lib/format";
import { IconCheck } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order" };

export default async function OrderPage({ params, searchParams }: { params: { id: string }; searchParams: { new?: string } }) {
  const user = await requireUser(`/orders/${params.id}`);
  const db = await read();
  const o = db.orders.find((x) => x.id === params.id && x.userId === user.id);
  if (!o) notFound();
  const h = headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const codes = o.items.flatMap((i) => i.tagCodes.map((code) => ({ code, title: i.title, tag: db.tags.find((t) => t.code === code) })));
  const qrs = await Promise.all(codes.map((c) => QRCode.toDataURL(`${origin}/verify?code=${c.code}`, { margin: 1, width: 220 })));
  return (
    <div className="space-y-4">
      {searchParams.new && (
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ok text-white"><IconCheck /></span>
          <div><div className="font-extrabold">Order placed</div><div className="text-sm text-muted">Arrives {o.eta}. Paid via UPI.</div></div>
        </div>
      )}
      <div className="card space-y-2 p-4 text-sm">
        <div className="flex justify-between"><span className="font-bold">Order #{o.id}</span><span className="text-ok">{o.status}</span></div>
        <div className="text-muted">{fmtDate(o.createdAt)} · Payment ref {o.paymentRef}</div>
        <div>{o.name}, {o.address}, {o.city ? `${o.city} region, ` : ""}{o.state} {o.pincode}</div>
        <div className="divide-y divide-line border-t border-line pt-1">
          {o.items.map((i) => (
            <div key={i.id} className="flex justify-between gap-3 py-2">
              <span>{i.title} × {i.qty}{i.editionNos.length > 0 && <span className="ml-1 rounded bg-accentsoft px-1.5 text-xs font-bold text-accent">{i.editionNos.map((n) => `#${String(n).padStart(4, "0")}`).join(", ")}</span>}</span>
              <span className="font-semibold">{inr(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><span>Total</span><span>{inr(o.total)}</span></div>
      </div>
      <section>
        <h2 className="font-bold">Authenticity tags in your parcel</h2>
        <p className="mb-2 text-xs text-muted">In production these are printed on the hang-tag or inside cover. For the demo, scan one with another phone or open it in Verify.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {codes.slice(0, 24).map((c, i) => (
            <Link key={c.code} href={`/verify?code=${c.code}`} className="card p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrs[i]} alt={`QR for ${c.title}`} className="mx-auto w-full max-w-[150px] rounded bg-white p-1" />
              <div className="mt-1 line-clamp-1 text-[11px] font-semibold">{c.title}{c.tag?.editionNo ? ` #${String(c.tag.editionNo).padStart(4, "0")}` : ""}</div>
              <div className="font-mono text-[10px] text-muted">{c.code}</div>
            </Link>
          ))}
        </div>
        {codes.length > 24 && <p className="mt-2 text-xs text-muted">+{codes.length - 24} more tags</p>}
      </section>
    </div>
  );
}
