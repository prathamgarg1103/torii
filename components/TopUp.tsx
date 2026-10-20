"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PayButton from "./PayButton";
export default function TopUp({ amounts }: { amounts: number[] }) {
  const router = useRouter();
  const [amt, setAmt] = useState(amounts[1]);
  const [done, setDone] = useState("");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">{amounts.map((a) => <button key={a} className={amt === a ? "chip-on" : "chip"} onClick={() => setAmt(a)}>₹{a}</button>)}</div>
      <PayButton purpose="topup" payload={{ amount: amt }} onSuccess={(r) => { setDone(`Added ₹${amt}. New balance ₹${r.wallet}`); router.refresh(); }}>Add ₹{amt} with UPI</PayButton>
      {done && <p className="text-sm text-ok">{done}</p>}
    </div>
  );
}
