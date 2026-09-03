"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "../page";
import { Spinner } from "@/app/(auth)/login/login-form";
import { timeAgo } from "@/lib/utils";

interface Conversation { id: string; contactName: string | null; waPhone: string; leadScore: number; leadStatus: string; status: string; mode: string; updatedAt: string; lastMessage: { body: string; role: string; createdAt: string } | null; messageCount: number; }
const statusColors: Record<string, string> = { new: "bg-slate-100 text-slate-600", qualified: "bg-amber-50 text-amber-700", converted: "bg-emerald-50 text-emerald-700", not_a_lead: "bg-rose-50 text-rose-600" };

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  function load() { setError(null); setConversations(null); fetch("/api/conversations").then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || "Failed to load conversations."); setConversations(data.conversations); }).catch((e) => setError(e.message)); }
  useEffect(load, []);
  if (error) return <EmptyState icon="⚠️" title="Couldn't load conversations" desc={error} onAction={load} actionLabel="Retry" />;
  if (!conversations) return <div className="flex items-center justify-center py-24 text-slate-400"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm">Loading conversations…</span></div>;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="heading-lg">Conversations</h1><p className="mt-1 text-slate-500">Every customer chat, answered and scored.</p></div><Link href="/dashboard/knowledge" className="btn-secondary text-sm">🧠 Review FAQs first</Link></div>
      {conversations.length === 0 ? (
        <EmptyState icon="📭" title="No conversations yet" desc="When customers message your WhatsApp (or you try the simulator), their chats will show up here." />
      ) : (
        <div className="card overflow-hidden"><ul className="divide-y divide-slate-100">{conversations.map((c) => (<li key={c.id}><Link href={`/dashboard/conversations/${c.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{(c.contactName || c.waPhone).charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-medium text-slate-900">{c.contactName || "Unknown customer"}</p><span className="text-xs text-slate-400">+{c.waPhone}</span><span className={`badge shrink-0 ${c.mode === "human" ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700"}`}>{c.mode === "human" ? "👤 human" : "🤖 ai"}</span></div><p className="mt-0.5 truncate text-sm text-slate-500">{c.lastMessage?.body || "—"}</p></div><div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex"><span className={`badge ${statusColors[c.leadStatus] || statusColors.new}`}>🎯 {c.leadScore}/20 · {c.leadStatus.replace("_", " ")}</span><span className="text-xs text-slate-400">{timeAgo(c.updatedAt)} · {c.messageCount} msgs</span></div></Link></li>))}</ul></div>
      )}
    </div>
  );
}