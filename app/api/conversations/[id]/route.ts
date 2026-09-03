import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { CONVERSATION_MODE } from "@/lib/constants";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const conversation = await prisma.conversation.findFirst({
    where: { id: params.id, userId: auth.ctx.user.id },
    include: {
      contact: { select: { id: true, name: true, waPhone: true, leadScore: true, leadStatus: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  return NextResponse.json({ conversation });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const mode = (body as { mode?: string })?.mode;
  const conversation = await prisma.conversation.findFirst({ where: { id: params.id, userId: auth.ctx.user.id } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  if (mode === CONVERSATION_MODE.HUMAN || mode === CONVERSATION_MODE.AI) {
    const updated = await prisma.conversation.update({ where: { id: conversation.id }, data: { mode } });
    return NextResponse.json({ conversation: updated });
  }
  return NextResponse.json({ error: "mode must be 'ai' or 'human'." }, { status: 400 });
}