import { LEAD_STRONG_INTEREST, LEAD_NEEDS_INFO, LEAD_CONTACT_INTENT, CONTACT_STATUS } from "@/lib/constants";

export interface LeadScoreResult {
  score: number;
  status: string;
  reasons: string[];
}

export function scoreLead(message: string, existingScore = 0): LeadScoreResult {
  const text = message.toLowerCase();
  let score = existingScore;
  const reasons: string[] = [];

  const hits = (bank: string[], label: string, weight: number, max = 3) => {
    let n = 0;
    for (const k of bank) {
      if (text.includes(k)) { n += 1; reasons.push(`${label}: "${k}"`); if (n >= max) break; }
    }
    return n * weight;
  };

  score += hits(LEAD_STRONG_INTEREST, "buying intent", 3);
  score += hits(LEAD_NEEDS_INFO, "researching", 1);
  score += hits(LEAD_CONTACT_INTENT, "wants human", 2);

  if (/\b(today|asap|urgent|jaldi|kal|tomorrow|immediately|now)\b/.test(text)) { score += 2; reasons.push("urgency"); }
  const phoneMatch = text.match(/(\+?\d{9,15})/);
  if (phoneMatch) { score += 2; reasons.push("shared phone number"); }
  if (/\b(deliver|delivery|shipping|where are you|address|location|timing|hours|open|close|kahan)\b/.test(text)) { score += 1; reasons.push("logistics question"); }

  let status: string = CONTACT_STATUS.NEW;
  if (score >= 6) status = CONTACT_STATUS.QUALIFIED;
  if (score >= 10) status = CONTACT_STATUS.CONVERTED;

  return { score: Math.min(score, 20), status, reasons: reasons.slice(0, 6) };
}

export function extractName(message: string): string | null {
  const m =
    message.match(/\b(?:my name is|i am|i'm|mera naam|name is)\s+([A-Za-z][A-Za-z\s]{1,40}?)(?:\.|,|$)/i) ||
    message.match(/\b(?:my name's|this is)\s+([A-Za-z][A-Za-z\s]{1,40}?)(?:\.|,|$)/i);
  if (!m) return null;
  const name = m[1]!.trim().split(/\s+/).slice(0, 2).join(" ");
  if (name.length < 2 || /\b(hi|hello|hey)\b/i.test(name)) return null;
  return name.charAt(0).toUpperCase() + name.slice(1);
}