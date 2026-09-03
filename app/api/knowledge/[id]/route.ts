import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { knowledgeSchema } from "@/lib/validation";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const existing = await prisma.knowledgeItem.findFirst({ where: { id: params.id, userId: auth.ctx.user.id } });
  if (!existing) return NextResponse.json({ error: "Knowledge item not found." }, { status: 404 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = knowledgeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  const item = await prisma.knowledgeItem.update({ where: { id: existing.id }, data: { question: parsed.data.question, answer: parsed.data.answer, keywords: parsed.data.keywords || "" } });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const existing = await prisma.knowledgeItem.findFirst({ where: { id: params.id, userId: auth.ctx.user.id } });
  if (!existing) return NextResponse.json({ error: "Knowledge item not found." }, { status: 404 });
  await prisma.knowledgeItem.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}