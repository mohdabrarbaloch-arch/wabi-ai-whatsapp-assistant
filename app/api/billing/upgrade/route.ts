import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { createCheckoutSession, stripeConfigured } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  let plan = "pro";
  try {
    const b = (await req.json()) as { plan?: string };
    if (b.plan === "growth" || b.plan === "pro") plan = b.plan;
  } catch { /* defaults to pro */ }
  try {
    const { url, mode } = await createCheckoutSession(auth.ctx.user.id, plan as "pro" | "growth");
    return NextResponse.json({ url, mode, stripeConfigured: stripeConfigured() });
  } catch {
    return NextResponse.json({ error: "Could not create a checkout session. Try again." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  let plan = "pro";
  try {
    const b = (await req.json()) as { plan?: string };
    if (b.plan === "growth") plan = "growth";
  } catch { /* pro */ }
  await prisma.user.update({ where: { id: auth.ctx.user.id }, data: { plan } });
  return NextResponse.json({ ok: true, plan });
}