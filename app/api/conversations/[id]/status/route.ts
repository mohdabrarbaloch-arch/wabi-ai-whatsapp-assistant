import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const conversation = await prisma.conversation.findFirst({ where: { id: params.id, userId: auth.ctx.user.id } });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  let action: "close" | "reopen" = "close";
  try {
    const b = (await req.json()) as { action?: string };
    if (b.action === "reopen") action = "reopen";
    else if (b.action && b.action !== "close") return NextResponse.json({ error: "action must be 'close' or 'reopen'." }, { status: 400 });
  } catch { /* no body -> close */ }
  const updated = await prisma.conversation.update({ where: { id: conversation.id }, data: { status: action === "close" ? "closed" : "open" } });
  return NextResponse.json({ conversation: updated });
}