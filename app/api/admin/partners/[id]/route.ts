import { mutate } from "@/lib/db";
import { body, fail, ok } from "@/lib/api";
import { toriiStaff } from "@/lib/partner-api";

/** Marks a publisher as verified (company identity and rights checked) or removes the mark. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await toriiStaff())) return fail("Torii staff only", 403);
  const { verified } = await body<{ verified: boolean }>(req);
  const found = await mutate((d) => { const o = d.partners.find((x) => x.id === params.id); if (o) o.verified = !!verified; return !!o; });
  return found ? ok({ verified: !!verified }) : fail("Partner not found", 404);
}
