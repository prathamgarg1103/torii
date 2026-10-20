import { redirect } from "next/navigation";
import { read } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { cartFor } from "@/lib/catalog";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function Checkout() {
  const user = await requireUser("/checkout");
  const db = await read();
  const { lines, total } = cartFor(db, user.id);
  if (!lines.length) redirect("/cart");
  const last = [...db.orders].reverse().find((o) => o.userId === user.id);
  return <CheckoutForm total={total} count={lines.reduce((s, l) => s + l.qty, 0)} defaults={{ name: last?.name ?? user.name ?? "", address: last?.address ?? "", pincode: last?.pincode ?? "" }} />;
}
