import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { CONVERSATION_STATUS, CONTACT_STATUS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const userId = auth.ctx.user.id;
  const monthStart = new Date();
  monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  const [totalConversations, openConversations, totalContacts, qualifiedLeads, aiMessagesThisMonth, recentConversations] = await Promise.all([
    prisma.conversation.count({ where: { userId } }),
    prisma.conversation.count({ where: { userId, status: CONVERSATION_STATUS.OPEN } }),
    prisma.contact.count({ where: { userId } }),
    prisma.contact.count({ where: { userId, leadStatus: { in: [CONTACT_STATUS.QUALIFIED, CONTACT_STATUS.CONVERTED] } } }),
    prisma.aiMessageLog.count({ where: { userId, createdAt: { gte: monthStart } } }),
    prisma.conversation.findMany({
      where: { userId }, orderBy: { updatedAt: "desc" }, take: 6,
      include: { contact: { select: { name: true, waPhone: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, role: true } } },
    }),
  ]);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  return NextResponse.json({
    stats: {
      plan: user?.plan ?? "free", totalConversations, openConversations, totalContacts, qualifiedLeads, aiMessagesThisMonth,
      recentConversations: recentConversations.map((c) => ({ id: c.id, contactName: c.contact.name || c.contact.waPhone, mode: c.mode, updatedAt: c.updatedAt, lastMessage: c.messages[0] ?? null })),
    },
  });
}