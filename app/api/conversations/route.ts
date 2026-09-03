import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const conversations = await prisma.conversation.findMany({
    where: { userId: auth.ctx.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      contact: { select: { id: true, name: true, waPhone: true, leadScore: true, leadStatus: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, role: true, createdAt: true } },
      _count: { select: { messages: true } },
    },
  });
  const data = conversations.map((c) => ({
    id: c.id, contactName: c.contact.name, waPhone: c.contact.waPhone, leadScore: c.contact.leadScore,
    leadStatus: c.contact.leadStatus, status: c.status, mode: c.mode, summary: c.summary, updatedAt: c.updatedAt,
    lastMessage: c.messages[0] ?? null, messageCount: c._count.messages,
  }));
  return NextResponse.json({ conversations: data });
}