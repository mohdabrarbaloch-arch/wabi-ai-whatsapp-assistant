import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { currentAiProvider } from "@/lib/pipeline";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  return NextResponse.json({ provider: currentAiProvider() });
}