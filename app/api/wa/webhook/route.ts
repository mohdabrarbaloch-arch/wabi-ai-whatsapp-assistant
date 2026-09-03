import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookHub } from "@/lib/whatsapp";
import { waWebhookBodySchema } from "@/lib/validation";
import { processInbound } from "@/lib/pipeline";
import { sendWhatsAppText } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("hub.mode");
  const token = sp.get("hub.verify_token");
  const challenge = sp.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN || "wabi_verify_change_me";
  const check = verifyWebhookHub(mode, token, challenge, expected);
  if (!check.ok) return new NextResponse("Verification failed", { status: 403 });
  return new NextResponse(check.challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const raw = body as { object?: string; entry?: Array<{ changes?: Array<{ field?: string }> }>; phone?: string; message?: string; businessId?: string };
  if (raw.object === "whatsapp_business_account" || raw.entry) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const parsed = waWebhookBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload. Expected { phone, message }." }, { status: 400 });
  }

  let owner = null;
  if (raw.businessId) owner = await prisma.user.findFirst({ where: { whatsappPhoneId: raw.businessId } });
  if (!owner) owner = await prisma.user.findFirst({ where: { waConnected: true } });
  if (!owner) {
    return NextResponse.json({ error: "No connected WhatsApp business found." }, { status: 404 });
  }

  const result = await processInbound(owner.id, parsed.data.phone, parsed.data.message);

  if (!result.gated && owner.waConnected && owner.whatsappPhoneId && process.env.WHATSAPP_TOKEN) {
    try {
      await sendWhatsAppText(parsed.data.phone, result.reply.body, owner.whatsappPhoneId, process.env.WHATSAPP_TOKEN);
    } catch {
      // reply persisted in DB; dashboard will show it
    }
  }

  return NextResponse.json({ received: true, result }, { status: 200 });
}