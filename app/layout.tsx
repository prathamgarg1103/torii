import "@fontsource/dela-gothic-one/400.css";
import "@fontsource-variable/hanken-grotesk";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import AppShell from "@/components/AppShell";
import SWRegister from "@/components/SWRegister";
import { currentUser } from "@/lib/auth";
import { read } from "@/lib/db";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_TAGLINE,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1a1625" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const cartCount = user ? (await read()).cart.filter((c) => c.userId === user.id).reduce((s, c) => s + c.qty, 0) : 0;
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <AppShell signedIn={!!user} cartCount={cartCount} wallet={user?.wallet ?? 0}>{children}</AppShell>
        <SWRegister />
      </body>
    </html>
  );
}
