import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  try {
    const result = await handleStripeWebhook(raw, signature);
    return NextResponse.json(result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "invalid signature") return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    return NextResponse.json({ error: "Webhook error." }, { status: 500 });
  }
}