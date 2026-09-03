// AI provider abstraction. Three interchangeable backends:
//   1. OpenAI   (env OPENAI_API_KEY)  — default when key present
//   2. Gemini   (env GEMINI_API_KEY)  — used when no OpenAI key
//   3. Offline keyword engine         — used when neither key is set
// The rest of the app talks to `completeReply()` / `summarize()` and never
// touches provider specifics. API keys live ONLY on the server (env).

export interface ReplyContext {
  businessName: string;
  category: string;
  welcomeMessage: string;
  knowledge: Array<{ question: string; answer: string; keywords: string }>;
  contactName: string | null;
  history: Array<{ role: "customer" | "assistant"; body: string }>;
  leadStatus: string;
  humanHandoff: boolean;
}

export type ProviderName = "openai" | "gemini" | "offline";

export function activeProvider(): ProviderName {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "offline";
}

function buildSystemPrompt(ctx: ReplyContext): string {
  const kb = ctx.knowledge.map((k) => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n");
  const history = ctx.history.slice(-4).map((h) => `${h.role === "customer" ? "Customer" : "Assistant"}: ${h.body}`).join("\n");
  return [
    `You are the friendly AI assistant of "${ctx.businessName}" (${ctx.category || "a business"}) on WhatsApp.`,
    "You answer customer questions using ONLY the knowledge base below when relevant. Be warm, concise (max ~120 words), and conversational — like a helpful salesperson. Use the customer's language (Urdu/Roman-Urdu/English).",
    "Never invent prices, stock, or policies not in the knowledge base — instead say you'll have a team member follow up.",
    ctx.leadStatus === "qualified" || ctx.leadStatus === "converted"
      ? "This customer is an interested lead — be extra helpful, ask if they'd like help completing the purchase/booking, and mention a team member can assist."
      : "If the customer seems interested in buying or booking, ask one light question to help them (e.g. which option they prefer) and reassure them a team member can finalize it.",
    "",
    "=== KNOWLEDGE BASE ===",
    kb.trim() || "(no entries yet)",
    "",
    "=== RECENT CONVERSATION ===",
    history.trim() || "(none)",
  ].join("\n");
}

export async function completeReply(ctx: ReplyContext): Promise<{ text: string; provider: ProviderName; status: "ok" | "fallback" | "error" }> {
  const provider = activeProvider();
  if (provider === "openai") return completeOpenAI(ctx);
  if (provider === "gemini") return completeGemini(ctx);
  return completeOffline(ctx);
}

async function completeOpenAI(ctx: ReplyContext): Promise<{ text: string; provider: ProviderName; status: "ok" | "fallback" | "error" }> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: buildSystemPrompt(ctx) },
          ...ctx.history.slice(-4).map((h) => ({ role: h.role === "customer" ? "user" : "assistant", content: h.body })),
          { role: "user", content: "Customer's last message is the final line above. Reply to the customer now." },
        ],
        max_tokens: 300,
        temperature: 0.6,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("empty openai response");
    return { text, provider: "openai", status: "ok" };
  } catch {
    return completeOffline(ctx);
  }
}

async function completeGemini(ctx: ReplyContext): Promise<{ text: string; provider: ProviderName; status: "ok" | "fallback" | "error" }> {
  try {
    const key = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt(ctx) }] },
        contents: [{ role: "user", parts: [...ctx.history.slice(-4).map((h) => ({ text: `${h.role === "customer" ? "Customer" : "Assistant"}: ${h.body}` })), { text: "Reply to the customer now." }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`gemini ${res.status}`);
    const data = (await res.json()) as { candidates: Array<{ content: { parts: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
    if (!text) throw new Error("empty gemini response");
    return { text, provider: "gemini", status: "ok" };
  } catch {
    return completeOffline(ctx);
  }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, " ").replace(/\s+/g, " ").trim();
}

export function scoreKnowledge(text: string, ctx: ReplyContext): Array<{ item: { question: string; answer: string; keywords: string }; score: number }> {
  const n = normalize(text);
  const words = n.split(" ").filter((w) => w.length > 2);
  const out: Array<{ item: { question: string; answer: string; keywords: string }; score: number }> = [];
  for (const item of ctx.knowledge) {
    let score = 0;
    const q = normalize(item.question);
    const kws = normalize(item.keywords).split(",").map((s) => s.trim()).filter(Boolean);
    for (const w of words) {
      if (q.includes(w)) score += 2;
      if (kws.includes(w)) score += 3;
    }
    if (q.split(" ").some((qw) => qw.length > 3 && n.includes(qw))) score += 1;
    if (score > 0) out.push({ item, score });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, 2);
}

export async function completeOffline(ctx: ReplyContext): Promise<{ text: string; provider: ProviderName; status: "ok" | "fallback" | "error" }> {
  const matches = scoreKnowledge(ctx.history.length ? ctx.history[ctx.history.length - 1]!.body : "", ctx);
  if (matches.length) {
    const top = matches[0]!;
    return { text: `Great question! Here's what we know:\n\n${top.item.answer}\n\nAnything else I can help with? 😊`, provider: "offline", status: "ok" };
  }
  const hello = /\b(hi|hello|hey|salam|assalam)\b|^hi|^hello|^hey/i.test(ctx.history[ctx.history.length - 1]?.body ?? "");
  if (hello) {
    return { text: `Hello${ctx.contactName ? ` ${ctx.contactName}` : ""}! 👋 Thanks for messaging ${ctx.businessName}. How can I help you today?`, provider: "offline", status: "ok" };
  }
  if (/\b(thank|thanks|shukria|shukriya)\b/i.test(ctx.history[ctx.history.length - 1]?.body ?? "")) {
    return { text: "You're most welcome! 😊 Is there anything else I can help you with?", provider: "offline", status: "ok" };
  }
  return {
    text: `Thanks for your message! A member of the ${ctx.businessName} team will get back to you shortly. If you'd like quicker help, you can also ask about our products, prices, or hours. 🙂`,
    provider: "offline",
    status: "ok",
  };
}

export async function summarizeConversation(ctx: ReplyContext): Promise<{ text: string; provider: ProviderName; status: "ok" | "fallback" | "error" }> {
  const provider = activeProvider();
  if (provider === "offline") {
    const last = ctx.history[ctx.history.length - 1];
    return { text: `Customer ${ctx.contactName || "contact"} discussed: ${last ? last.body.slice(0, 90) : "general inquiry"}${ctx.leadStatus !== "new" ? `. Lead status: ${ctx.leadStatus}.` : ""}`, provider: "offline", status: "ok" };
  }
  const sys = "Summarize this WhatsApp business conversation in 1-2 sentences for a busy owner: who the customer is/what they want, key facts (product, price, intent), and current status. Write in English, plain text, no labels.";
  const prompt = ctx.history.map((h) => `${h.role === "customer" ? "Customer" : "Assistant"}: ${h.body}`).join("\n");
  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages: [{ role: "system", content: sys }, { role: "user", content: prompt }], max_tokens: 180 }),
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) throw new Error(`openai ${res.status}`);
      const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return { text, provider: "openai", status: "ok" };
      throw new Error("empty");
    }
    const key = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 180 } }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`gemini ${res.status}`);
    const data = (await res.json()) as { candidates: Array<{ content: { parts: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
    if (text) return { text, provider: "gemini", status: "ok" };
    throw new Error("empty");
  } catch {
    const last = ctx.history[ctx.history.length - 1];
    return { text: `Customer ${ctx.contactName || "contact"} discussed: ${last ? last.body.slice(0, 90) : "general inquiry"}. Lead status: ${ctx.leadStatus}.`, provider: "offline", status: "fallback" };
  }
}