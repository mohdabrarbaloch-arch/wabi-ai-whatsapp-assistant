import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { makeSummary, currentAiProvider } from "@/lib/pipeline";
import { featureGate } from "@/lib/billing";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const gate = featureGate(auth.ctx.user.plan, "summaries");
  if (gate) return NextResponse.json({ error: gate }, { status: 403 });
  try {
    const { text, provider } = await makeSummary(params.id, auth.ctx.user.id);
    return NextResponse.json({ summary: text, provider });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "not_found") return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ error: "Could not summarize this conversation." }, { status: 500 });
  }
}