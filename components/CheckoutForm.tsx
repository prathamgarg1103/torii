"use client";
import { useMemo, useState } from "react";
import PayButton from "./PayButton";
import { pincodeInfo } from "@/lib/geo";

export default function CheckoutForm({ total, count, defaults }: { total: number; count: number; defaults: { name: string; address: string; pincode: string } }) {
  const [name, setName] = useState(defaults.name);
  const [address, setAddress] = useState(defaults.address);
  const [pincode, setPincode] = useState(defaults.pincode);
  const info = useMemo(() => pincodeInfo(pincode), [pincode]);
  const ready = name.trim().length > 1 && address.trim().length >= 8 && info.valid;
  return (
    <div className="space-y-4">
      <h1 className="h-title">Delivery address</h1>
      <div className="card space-y-3 p-4">
        <label className="block"><span className="label">Full name</span><input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
        <label className="block"><span className="label">Address</span><textarea className="input mt-1 min-h-[80px]" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no., street, area, landmark" autoComplete="street-address" /></label>
        <label className="block"><span className="label">Pincode</span>
          <input className="input mt-1" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 151001" autoComplete="postal-code" />
        </label>
        {pincode.length === 6 && (info.valid
          ? <div className="rounded-xl bg-accentsoft px-3 py-2 text-sm text-accent">Delivering to {info.city ? `${info.city} region, ` : ""}{info.state} · arrives <b>{info.eta}</b></div>
          : <div className="text-sm text-bad">We don't recognise that pincode.</div>)}
      </div>
      <div className="card flex justify-between p-4 font-extrabold"><span>{count} item{count > 1 ? "s" : ""}</span><span>₹{total.toLocaleString("en-IN")}</span></div>
      <PayButton purpose="order" payload={{ name, address, pincode }} disabled={!ready} onSuccess={(r) => { location.href = `/orders/${r.orderId}?new=1`; }}>
        Pay ₹{total.toLocaleString("en-IN")} with UPI
      </PayButton>
    </div>
  );
}
