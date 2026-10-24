"use client";
import { usePathname } from "next/navigation";
/** Renders its children everywhere except under one path prefix. */
export default function HideOn({ prefix, children }: { prefix: string; children: React.ReactNode }) {
  return (usePathname() || "/").startsWith(prefix) ? null : <>{children}</>;
}
