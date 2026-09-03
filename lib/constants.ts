// Shared constants: plans, limits, statuses. Single source of truth used by
// the server (gating, billing) and (safe subsets) by the client.

export const PLANS = {
  free: { name: "Free", priceMonthly: 0, priceYearly: 0 },
  pro: { name: "Pro", priceMonthly: 2500, priceYearly: 25000 }, // PKR
  growth: { name: "Growth", priceMonthly: 6500, priceYearly: 65000 },
} as const;

export type PlanId = keyof typeof PLANS;

export const PLAN_LIMITS = {
  free: {
    aiMessages: 50, contacts: 50, knowledge: 20, conversations: 100,
    features: { humanHandoff: false, summaries: false, leadScoring: false, advancedAI: false },
  },
  pro: {
    aiMessages: 1000, contacts: 1000, knowledge: 200, conversations: 5000,
    features: { humanHandoff: true, summaries: true, leadScoring: true, advancedAI: false },
  },
  growth: {
    aiMessages: 10000, contacts: 10000, knowledge: 2000, conversations: 50000,
    features: { humanHandoff: true, summaries: true, leadScoring: true, advancedAI: true },
  },
} as const;

export type PlanLimits = typeof PLAN_LIMITS;

export const CONVERSATION_STATUS = { OPEN: "open", CLOSED: "closed" } as const;
export const CONVERSATION_MODE = { AI: "ai", HUMAN: "human" } as const;
export const CONTACT_STATUS = {
  NEW: "new", QUALIFIED: "qualified", CONVERTED: "converted", NOT_A_LEAD: "not_a_lead",
} as const;
export const MESSAGE_ROLE = { CUSTOMER: "customer", ASSISTANT: "assistant", AGENT: "agent" } as const;
export const MESSAGE_KIND = { AUTO_REPLY: "auto_reply", SUMMARY: "summary", SUGGESTION: "suggestion" } as const;

export const LEAD_STRONG_INTEREST = [
  "price", "pricing", "cost", "how much", "kitne", "buy", "order", "purchase",
  "booking", "book", "appointment", "quote", "estimate", "delivery", "deliver",
  "payment", "pay", "whatsapp number", "link", "checkout",
];
export const LEAD_NEEDS_INFO = [
  "recommend", "suggest", "difference", "compare", "versus", "vs", "suitable",
  "best for", "kaunsa", "option", "available", "stock", "sale", "discount",
  "coupon", "offer", "reviews", "review", "material", "size", "color", "colour",
];
export const LEAD_CONTACT_INTENT = [
  "call me", "call", "phone", "number", "contact", "reach", "talk", "agent",
  "human", "customer service", "speak", "representative", "man se baat",
  "aadmi", "real person", "muqami",
];