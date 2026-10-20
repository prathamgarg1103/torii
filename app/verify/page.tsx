import Verify from "@/components/Verify";
import { currentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "Verify" };
export default function VerifyPage({ searchParams }: { searchParams: { code?: string } }) {
  return <Verify initialCode={searchParams.code ?? ""} signedIn={!!currentUser()} />;
}
