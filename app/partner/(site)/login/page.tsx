import { redirect } from "next/navigation";
import PartnerLogin from "@/components/partner/PartnerLogin";
import { currentPartner } from "@/lib/partner-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: { next?: string; demo?: string } }) {
  const next = searchParams.next?.startsWith("/partner/") ? searchParams.next : "/partner/dashboard";
  if (await currentPartner()) redirect(next);
  return <PartnerLogin next={next} demo={searchParams.demo === "1"} />;
}
