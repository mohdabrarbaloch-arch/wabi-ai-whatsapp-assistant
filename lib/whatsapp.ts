import { prisma } from "@/lib/prisma";
import { MESSAGE_ROLE } from "@/lib/constants";

export async function sendWhatsAppText(to: string, text: string, phoneId: string, token: string): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || "v20.0"}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WhatsApp API error ${res.status}: ${body.slice(0, 200)}`);
  }
}

export function verifyWebhookHub(mode: string | null, token: string | null, challenge: string | null, expected: string): { ok: boolean; challenge?: string } {
  if (mode === "subscribe" && token === expected && challenge) return { ok: true, challenge };
  return { ok: false };
}

export async function handleIncomingMessage(userId: string, waPhone: string, message: string) {
  let contact = await prisma.contact.findFirst({ where: { userId, waPhone } });
  if (!contact) contact = await prisma.contact.create({ data: { userId, waPhone } });
  let conversation = await prisma.conversation.findFirst({ where: { userId, contactId: contact.id, status: "open" }, orderBy: { updatedAt: "desc" } });
  if (!conversation) conversation = await prisma.conversation.create({ data: { userId, contactId: contact.id, status: "open", mode: "ai" } });
  await prisma.message.create({ data: { conversationId: conversation.id, role: MESSAGE_ROLE.CUSTOMER, body: message } });
  await prisma.contact.update({ where: { id: contact.id }, data: { lastMessageAt: new Date() } });
  return { contact, conversation };
}