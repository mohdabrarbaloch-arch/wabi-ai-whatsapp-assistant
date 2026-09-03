// Billing & usage service — plan gating, usage metering, Stripe integration.
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, type PlanId } from "@/lib/constants";

type PlanShape = (typeof PLAN_LIMITS)[keyof typeof PLAN_LIMITS];
const planIds = new Set<string>(Object.keys(PLAN_LIMITS));
function planLimits(plan: string): PlanShape {
  return planIds.has(plan) ? PLAN_LIMITS[plan as PlanId] : PLAN_LIMITS.free;
}

export interface UsageSnapshot {
  aiMessages: number; contacts: number; conversations: number; knowledge: number;
  limits: { aiMessages: number; contacts: number; knowledge: number; conversations: number; features: { humanHandoff: boolean; summaries: boolean; leadScoring: boolean; advancedAI: boolean } };
  plan: string; aiPercent: number; contactsPercent: number; kbPercent: number; convPercent: number;
}

function percent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export async function getUsage(userId: string): Promise<UsageSnapshot> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("user_not_found");
  const limits = planLimits(user.plan);
  const monthStart = new Date();
  monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  const [aiMessages, contacts, conversations, knowledge] = await Promise.all([
    prisma.aiMessageLog.count({ where: { userId, createdAt: { gte: monthStart } } }),
    prisma.contact.count({ where: { userId } }),
    prisma.conversation.count({ where: { userId } }),
    prisma.knowledgeItem.count({ where: { userId } }),
  ]);
  return {
    aiMessages, contacts, conversations, knowledge, limits, plan: user.plan,
    aiPercent: percent(aiMessages, limits.aiMessages), contactsPercent: percent(contacts, limits.contacts),
    kbPercent: percent(knowledge, limits.knowledge), convPercent: percent(conversations, limits.conversations),
  };
}

export async function assertCanUse(userId: string, kind: "ai_reply" | "contact" | "conversation" | "knowledge"): Promise<void> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) throw new Error("user_not_found");
  const limits = planLimits(u.plan);
  const monthStart = new Date();
  monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  if (kind === "ai_reply") {
    const c = await prisma.aiMessageLog.count({ where: { userId, createdAt: { gte: monthStart } } });
    if (c >= limits.aiMessages) throw new Error(`You've used all ${limits.aiMessages} AI replies on your ${u.plan} plan this month. Upgrade to keep the bot running — it costs less than one missed customer.`);
  }
  if (kind === "contact") {
    const c = await prisma.contact.count({ where: { userId } });
    if (c >= limits.contacts) throw new Error(`Contact limit (${limits.contacts}) reached on your ${u.plan} plan. Upgrade to add more.`);
  }
  if (kind === "knowledge") {
    const c = await prisma.knowledgeItem.count({ where: { userId } });
    if (c >= limits.knowledge) throw new Error(`You can save up to ${limits.knowledge} FAQ entries on the ${u.plan} plan. Upgrade for more.`);
  }
}

export async function logAiUsage(userId: string, kind: string, provider: string, status: string): Promise<void> {
  await prisma.aiMessageLog.create({ data: { userId, kind, provider, status } });
}

export function canUseFeature(plan: string, feature: keyof PlanShape["features"]): boolean {
  const p = planIds.has(plan) ? PLAN_LIMITS[plan as PlanId] : PLAN_LIMITS.free;
  return p.features[feature] === true;
}

export function featureGate(plan: string, feature: keyof PlanShape["features"]): string | null {
  if (canUseFeature(plan, feature)) return null;
  return "This feature is available on the Pro plan and above. Upgrade to unlock human handoff, conversation summaries, and lead scoring.";
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO);
}

export async function createCheckoutSession(userId: string, plan: PlanId): Promise<{ url: string; mode: "stripe" | "manual" }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("user_not_found");
  const priceId = plan === "pro" ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO : plan === "growth" ? process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH : null;
  if (!priceId || !process.env.STRIPE_SECRET_KEY) return { url: "", mode: "manual" };
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: userId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?canceled=1`,
  });
  return { url: session.url || "", mode: "stripe" };
}

export async function handleStripeWebhook(rawBody: string, signature: string): Promise<{ received: boolean; action?: string }> {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) return { received: true, action: "skipped-no-secret" };
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new Error("invalid signature");
  }
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as { client_reference_id?: string };
    if (s.client_reference_id) {
      await prisma.user.update({ where: { id: s.client_reference_id }, data: { plan: "pro" } });
      return { received: true, action: "plan-upgraded" };
    }
  }
  return { received: true, action: "ignored" };
}