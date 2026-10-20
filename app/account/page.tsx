import Link from "next/link";
import RevealScope from "@/components/RevealScope";
import { read } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { TOPUPS } from "@/lib/payments";
import TopUp from "@/components/TopUp";
import LogoutButton from "@/components/LogoutButton";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "You" };

export default async function Account({ searchParams }: { searchParams: { denied?: string } }) {
  const user = await requireUser("/account");
  const db = await read();
  const orders = db.orders.filter((o) => o.userId === user.id).length;
  const unlocks = db.unlocks.filter((u) => u.userId === user.id).length;
  const rows: [string, string, string][] = [
    ["/orders", "Orders", orders ? `${orders} placed` : "None yet"],
    ["/shelf", "My Shelf", `${unlocks} chapter${unlocks === 1 ? "" : "s"} unlocked`],
    ["/verify", "Check a product", "Scan its code"],
  ];
  if (user.isAdmin) rows.push(["/publisher", "Publisher dashboard", "Sales and reading data"]);
  return (
    <div className="space-y-6">
      {searchParams.denied && <p className="rounded-xl border border-bad/30 bg-bad/10 px-3 py-2.5 text-[14px] font-semibold text-bad">The publisher dashboard needs a publisher account.</p>}
      <section className="paper-band bleed relative -mt-5 overflow-hidden border-b border-line px-4 pb-6 pt-7 dark:border-line">
        <div className="tone pointer-events-none absolute -inset-y-12 inset-x-0 opacity-60" />
        <div className="relative">
          <h1 className="font-display text-[clamp(28px,8cqw,40px)] leading-none">{user.name || "Hello, reader"}</h1>
          <p className="mt-2 text-[14.5px] font-semibold">+91 {user.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}{user.isAdmin ? ", publisher account" : ""}</p>
        </div>
      </section>
      <section aria-labelledby="wallet" className="panel p-5">
        <h2 id="wallet" className="label">Wallet</h2>
        <div className="price mt-1 text-[40px] leading-none">{inr(user.wallet)}</div>
        <p className="mb-4 mt-2 text-[14px] text-muted">Pay for chapters in one tap. Add money with UPI.</p>
        <TopUp amounts={TOPUPS} />
      </section>
      <nav className="card divide-y divide-line" aria-label="Your account">
        {rows.map(([href, l, d]) => (
          <Link key={href} href={href} className="flex min-h-[56px] items-center justify-between px-4 hover:bg-accentsoft/40">
            <span className="font-bold">{l}</span><span className="text-[13.5px] text-muted">{d}</span>
          </Link>
        ))}
      </nav>
      <LogoutButton />
      <RevealScope />
    </div>
  );
}
