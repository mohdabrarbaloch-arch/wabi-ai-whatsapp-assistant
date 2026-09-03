import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { getUsage } from "@/lib/billing";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  try {
    const usage = await getUsage(auth.ctx.user.id);
    return NextResponse.json({ usage });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "user_not_found") return NextResponse.json({ error: "Account not found." }, { status: 404 });
    return NextResponse.json({ error: "Could not load usage." }, { status: 500 });
  }
}