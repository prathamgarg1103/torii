import Link from "next/link";
import { read } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { TOPUPS } from "@/lib/payments";
import TopUp from "@/components/TopUp";
import LogoutButton from "@/components/LogoutButton";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

export default async function Account({ searchParams }: { searchParams: { denied?: string } }) {
  const user = await requireUser("/account");
  const db = await read();
  const orders = db.orders.filter((o) => o.userId === user.id).length;
  const unlocks = db.unlocks.filter((u) => u.userId === user.id).length;
  return (
    <div className="space-y-4">
      {searchParams.denied && <div className="rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">The publisher dashboard is for publisher accounts only.</div>}
      <div className="card p-4">
        <div className="text-lg font-extrabold">{user.name || "Torii reader"}</div>
        <div className="text-sm text-muted">+91 {user.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}{user.isAdmin && " · Publisher admin"}</div>
      </div>
      <div className="card p-4">
        <div className="label">Wallet balance</div>
        <div className="text-3xl font-extrabold">{inr(user.wallet)}</div>
        <p className="mb-3 text-sm text-muted">Unlock chapters in one tap. Top up with UPI.</p>
        <TopUp amounts={TOPUPS} />
      </div>
      <div className="card divide-y divide-line">
        <Link href="/orders" className="flex justify-between px-4 py-3 text-sm"><span>Orders</span><span className="text-muted">{orders}</span></Link>
        <Link href="/shelf" className="flex justify-between px-4 py-3 text-sm"><span>My Shelf</span><span className="text-muted">{unlocks} chapters unlocked</span></Link>
        <Link href="/verify" className="flex justify-between px-4 py-3 text-sm"><span>Verify a product</span><span className="text-muted">Scan code</span></Link>
        {user.isAdmin && <Link href="/publisher" className="flex justify-between px-4 py-3 text-sm font-semibold"><span>Publisher dashboard</span><span>→</span></Link>}
      </div>
      <LogoutButton />
    </div>
  );
}
