import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { humanReplySchema } from "@/lib/validation";
import { MESSAGE_ROLE } from "@/lib/constants";
import { featureGate } from "@/lib/billing";
import { sendWhatsAppText } from "@/lib/whatsapp";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireUser(req);
  if ("res" in auth) return auth.res;
  const gate = featureGate(auth.ctx.user.plan, "humanHandoff");
  if (gate) return NextResponse.json({ error: gate }, { status: 403 });
  const conversation = await prisma.conversation.findFirst({
    where: { id: params.id, userId: auth.ctx.user.id },
    include: { contact: true, user: true },
  });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = humanReplySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  const message = await prisma.message.create({ data: { conversationId: conversation.id, role: MESSAGE_ROLE.AGENT, body: parsed.data.body } });
  await prisma.conversation.update({ where: { id: conversation.id }, data: { mode: "human", status: "open", updatedAt: new Date() } });
  let waStatus: "none" | "sent" | "error" = "none";
  if (conversation.user.waConnected && conversation.user.whatsappPhoneId && process.env.WHATSAPP_TOKEN) {
    try {
      await sendWhatsAppText(conversation.contact.waPhone, parsed.data.body, conversation.user.whatsappPhoneId, process.env.WHATSAPP_TOKEN);
      waStatus = "sent";
    } catch { waStatus = "error"; }
  }
  return NextResponse.json({ message, waStatus }, { status: 201 });
}