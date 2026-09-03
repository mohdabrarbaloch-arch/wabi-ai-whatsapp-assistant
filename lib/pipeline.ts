// Core inbound pipeline — shared by the Meta webhook and the demo simulator.
import { prisma } from "@/lib/prisma";
import { assertCanUse, logAiUsage } from "@/lib/billing";
import { completeReply, summarizeConversation, activeProvider } from "@/lib/ai/provider";
import { scoreLead, extractName } from "@/lib/leads";
import { MESSAGE_ROLE, MESSAGE_KIND, CONVERSATION_MODE } from "@/lib/constants";

export interface PipelineResult {
  contact: { id: string; waPhone: string; name: string | null; leadScore: number; leadStatus: string };
  conversation: { id: string; mode: string; summary: string };
  reply: { id: string; body: string; role: string };
  provider: string;
  gated: boolean;
  gatedMessage?: string;
}

export async function processInbound(userId: string, waPhone: string, message: string): Promise<PipelineResult> {
  try {
    await assertCanUse(userId, "ai_reply");
  } catch (e) {
    return {
      contact: { id: "", waPhone, name: null, leadScore: 0, leadStatus: "new" },
      conversation: { id: "", mode: "ai", summary: "" },
      reply: { id: "", body: (e as Error).message, role: MESSAGE_ROLE.ASSISTANT },
      provider: "gate", gated: true, gatedMessage: (e as Error).message,
    };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { business: true, knowledge: { orderBy: { updatedAt: "desc" } } } });
  if (!user) throw new Error("user_not_found");

  let contact = await prisma.contact.findFirst({ where: { userId, waPhone } });
  if (!contact) {
    contact = await prisma.contact.create({ data: { userId, waPhone, name: extractName(message) } });
  } else if (!contact.name) {
    const guessed = extractName(message);
    if (guessed) contact = await prisma.contact.update({ where: { id: contact.id }, data: { name: guessed } });
  }

  let conversation = await prisma.conversation.findFirst({ where: { userId, contactId: contact.id, status: "open" }, orderBy: { updatedAt: "desc" } });
  if (!conversation) conversation = await prisma.conversation.create({ data: { userId, contactId: contact.id, status: "open", mode: "ai" } });

  await prisma.message.create({ data: { conversationId: conversation.id, role: MESSAGE_ROLE.CUSTOMER, body: message } });

  const biz = user.business;
  const botEnabled = biz?.botEnabled ?? true;
  const inHumanMode = conversation.mode === CONVERSATION_MODE.HUMAN;
  if (!botEnabled || inHumanMode) {
    const note = inHumanMode
      ? "(A team member is handling this conversation — you'll be connected shortly.)"
      : "(We've received your message — a team member will reply shortly.)";
    const reply = await prisma.message.create({ data: { conversationId: conversation.id, role: MESSAGE_ROLE.ASSISTANT, body: note } });
    await prisma.contact.update({ where: { id: contact.id }, data: { lastMessageAt: new Date() } });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
    return {
      contact: { id: contact.id, waPhone: contact.waPhone, name: contact.name, leadScore: contact.leadScore, leadStatus: contact.leadStatus },
      conversation: { id: conversation.id, mode: conversation.mode, summary: conversation.summary },
      reply: { id: reply.id, body: reply.body, role: reply.role },
      provider: "none", gated: false,
    };
  }

  const scored = scoreLead(message, contact.leadScore);
  const nameGuess = extractName(message);
  await prisma.contact.update({
    where: { id: contact.id },
    data: { leadScore: scored.score, leadStatus: scored.status, lastMessageAt: new Date(), ...(nameGuess && !contact.name ? { name: nameGuess } : {}) },
  });
  contact = await prisma.contact.findUniqueOrThrow({ where: { id: contact.id } });

  const historyRows = await prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "asc" }, take: 8, select: { role: true, body: true } });
  const history = historyRows.map((m) => ({ role: (m.role === MESSAGE_ROLE.AGENT ? "assistant" : m.role) as "customer" | "assistant", body: m.body }));

  const aiResult = await completeReply({
    businessName: biz?.name || user.name,
    category: biz?.category || "",
    welcomeMessage: biz?.welcomeMessage || "",
    knowledge: user.knowledge.map((k) => ({ question: k.question, answer: k.answer, keywords: k.keywords })),
    contactName: contact.name,
    history,
    leadStatus: contact.leadStatus,
    humanHandoff: user.plan !== "free",
  });

  const reply = await prisma.message.create({ data: { conversationId: conversation.id, role: MESSAGE_ROLE.ASSISTANT, body: aiResult.text } });
  await logAiUsage(userId, MESSAGE_KIND.AUTO_REPLY, aiResult.provider, aiResult.status);
  await prisma.conversation.update({ where: { id: conversation.id }, data: { leadScore: scored.score, leadStatus: scored.status, updatedAt: new Date() } });

  return {
    contact: { id: contact.id, waPhone: contact.waPhone, name: contact.name, leadScore: contact.leadScore, leadStatus: contact.leadStatus },
    conversation: { id: conversation.id, mode: conversation.mode, summary: conversation.summary },
    reply: { id: reply.id, body: reply.body, role: reply.role },
    provider: aiResult.provider, gated: false,
  };
}

export async function makeSummary(conversationId: string, userId: string): Promise<{ text: string; provider: string }> {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, userId }, include: { messages: { orderBy: { createdAt: "asc" }, take: 50 }, contact: true } });
  if (!conversation) throw new Error("not_found");
  const history = conversation.messages.map((m) => ({ role: (m.role === MESSAGE_ROLE.AGENT ? "assistant" : m.role) as "customer" | "assistant", body: m.body }));
  const summary = await summarizeConversation({
    businessName: "business", category: "", welcomeMessage: "", knowledge: [],
    contactName: conversation.contact.name, history, leadStatus: conversation.leadStatus, humanHandoff: true,
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { summary: summary.text } });
  await logAiUsage(userId, MESSAGE_KIND.SUMMARY, summary.provider, summary.status);
  return { text: summary.text, provider: summary.provider };
}

export function currentAiProvider(): string {
  return activeProvider();
}