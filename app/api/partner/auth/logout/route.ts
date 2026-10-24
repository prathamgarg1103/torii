import { clearPartnerSession } from "@/lib/partner-auth";
import { ok } from "@/lib/api";
export async function POST() { clearPartnerSession(); return ok(); }
