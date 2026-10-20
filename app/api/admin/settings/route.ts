import { mutate } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { body, fail, ok } from "@/lib/api";
export async function POST(req: Request) {
  if (!currentUser()?.isAdmin) return fail("Publisher access only", 403);
  const { readingMode } = await body<{ readingMode: string }>(req);
  if (readingMode !== "free" && readingMode !== "paid") return fail("Invalid mode");
  mutate((db) => { db.settings.readingMode = readingMode; });
  return ok({ readingMode });
}
