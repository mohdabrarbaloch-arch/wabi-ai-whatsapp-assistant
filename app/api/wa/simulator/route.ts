import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { simulatorSchema } from "@/lib/validation";
import { processInbound } from "@/lib/pipeline";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`sim:${auth.ctx.user.id}:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: `Simulator is rate-limited. Try again in ${rl.retryAfterSec}s.` }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = simulatorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  try {
    const result = await processInbound(auth.ctx.user.id, parsed.data.waPhone, parsed.data.message);
    return NextResponse.json({ result }, { status: 200 });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "user_not_found") {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Something went wrong while processing the message. Please try again." }, { status: 500 });
  }
}