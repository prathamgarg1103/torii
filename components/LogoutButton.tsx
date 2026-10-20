"use client";
export default function LogoutButton() {
  return <button className="btn-ghost w-full" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/read"; }}>Sign out</button>;
}
