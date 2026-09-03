import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { businessSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const business = await prisma.business.findUnique({ where: { userId: auth.ctx.user.id } });
  return NextResponse.json({ business: business ?? { userId: auth.ctx.user.id, name: `${auth.ctx.user.name}'s Business`, category: "", timezone: "Asia/Karachi", botEnabled: true, welcomeMessage: "" } });
}

export async function PUT(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = businessSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  const data = {
    name: parsed.data.name, category: parsed.data.category || "", timezone: parsed.data.timezone,
    ...(parsed.data.welcomeMessage !== undefined ? { welcomeMessage: parsed.data.welcomeMessage } : {}),
    ...(parsed.data.botEnabled !== undefined ? { botEnabled: parsed.data.botEnabled } : {}),
  };
  const existing = await prisma.business.findUnique({ where: { userId: auth.ctx.user.id } });
  const business = existing
    ? await prisma.business.update({ where: { id: existing.id }, data })
    : await prisma.business.create({ data: { userId: auth.ctx.user.id, ...data } });
  return NextResponse.json({ business });
}