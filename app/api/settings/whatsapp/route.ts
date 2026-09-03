import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { waStatusSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = waStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  await prisma.user.update({ where: { id: auth.ctx.user.id }, data: { whatsappPhoneId: parsed.data.phoneId, waConnected: true } });
  return NextResponse.json({ ok: true, message: "WhatsApp connection saved. In production, set WHATSAPP_TOKEN in env and point Meta's webhook to /api/wa/webhook with your verify token." });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  await prisma.user.update({ where: { id: auth.ctx.user.id }, data: { waConnected: false, whatsappPhoneId: null } });
  return NextResponse.json({ ok: true });
}