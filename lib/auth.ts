import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { read } from "./db";
import type { User } from "./types";

const COOKIE = "torii_session";
const secret = () => process.env.AUTH_SECRET || "dev-auth-secret-change-me";
const sig = (v: string) => crypto.createHmac("sha256", secret()).update(v).digest("base64url");

export function sessionValue(userId: string) {
  return `${userId}.${sig(userId)}`;
}
export function setSession(userId: string) {
  cookies().set(COOKIE, sessionValue(userId), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
export function clearSession() {
  cookies().delete(COOKIE);
}
export async function currentUser(): Promise<User | null> {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const [uid, s] = raw.split(".");
  if (!uid || !s || sig(uid) !== s) return null;
  return (await read()).users.find((u) => u.id === uid) ?? null;
}
export async function requireUser(next = "/"): Promise<User> {
  const u = await currentUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}
export async function requireAdmin(): Promise<User> {
  const u = await requireUser("/publisher");
  if (!u.isAdmin) redirect("/account?denied=1");
  return u;
}
