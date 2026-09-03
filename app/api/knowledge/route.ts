import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { knowledgeSchema } from "@/lib/validation";
import { assertCanUse } from "@/lib/billing";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const items = await prisma.knowledgeItem.findMany({ where: { userId: auth.ctx.user.id }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  try { await assertCanUse(auth.ctx.user.id, "knowledge"); } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = knowledgeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  const item = await prisma.knowledgeItem.create({ data: { userId: auth.ctx.user.id, question: parsed.data.question, answer: parsed.data.answer, keywords: parsed.data.keywords || "" } });
  return NextResponse.json({ item }, { status: 201 });
}