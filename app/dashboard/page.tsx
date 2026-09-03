"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/app/(auth)/login/login-form";
import { timeAgo } from "@/lib/utils";

interface Stats { plan: string; totalConversations: number; openConversations: number; totalContacts: number; qualifiedLeads: number; aiMessagesThisMonth: number; recentConversations: Array<{ id: string; contactName: string; mode: string; updatedAt: string; lastMessage: { body: string; role: string } | null }>; }

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/dashboard/overview").then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || "Failed to load dashboard."); setStats(data.stats); }).catch((e) => setError(e.message));
  }, []);
  if (error) return <EmptyState icon="⚠️" title="Couldn't load your dashboard" desc={error} actionHref="/dashboard" actionLabel="Retry" />;
  if (!stats) return <div className="flex items-center justify-center py-24 text-slate-400"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm">Loading your overview…</span></div>;
  const cards = [
    { label: "Open conversations", value: stats.openConversations, sub: `${stats.totalConversations} total`, icon: "💬" },
    { label: "Contacts saved", value: stats.totalContacts, sub: "all time", icon: "👥" },
    { label: "Qualified leads", value: stats.qualifiedLeads, sub: "interested buyers", icon: "🎯" },
    { label: "AI replies (this month)", value: stats.aiMessagesThisMonth, sub: `on ${stats.plan} plan`, icon: "🤖" },
  ];
  return (
    <div className="space-y-8">
      <div><h1 className="heading-lg">Good to see you 👋</h1><p className="mt-1 text-slate-500">Here&apos;s what&apos;s happening with your WhatsApp.</p></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{cards.map((c) => (<div key={c.label} className="card p-5"><span className="text-xl" aria-hidden="true">{c.icon}</span><p className="mt-3 text-2xl font-bold text-slate-900">{c.value}</p><p className="text-sm font-medium text-slate-600">{c.label}</p><p className="text-xs text-slate-400">{c.sub}</p></div>))}</div>
      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Recent conversations</h2><Link href="/dashboard/conversations" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all →</Link></div>
        {stats.recentConversations.length === 0 ? (
          <div className="px-5 py-12 text-center"><p className="text-3xl">📭</p><p className="mt-2 font-medium text-slate-700">No conversations yet</p><p className="mt-1 text-sm text-slate-500">Try the <Link href="/dashboard/simulator" className="font-semibold text-brand-600">demo simulator</Link> to see Wabi answer a customer.</p></div>
        ) : (
          <ul className="divide-y divide-slate-100">{stats.recentConversations.map((c) => (<li key={c.id}><Link href={`/dashboard/conversations/${c.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{c.contactName.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate font-medium text-slate-900">{c.contactName}</p><span className="shrink-0 text-xs text-slate-400">{timeAgo(c.updatedAt)}</span></div><p className="truncate text-sm text-slate-500">{c.lastMessage ? c.lastMessage.body : "No messages yet"}</p></div><span className={`badge shrink-0 ${c.mode === "human" ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700"}`}>{c.mode === "human" ? "👤 human" : "🤖 ai"}</span></Link></li>))}</ul>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, desc, actionHref, actionLabel, onAction }: { icon: string; title: string; desc: string; actionHref?: string; actionLabel?: string; onAction?: () => void }) {
  const cls = "btn-primary mt-4";
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center"><p className="text-4xl">{icon}</p><h3 className="mt-3 font-semibold text-slate-900">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{desc}</p>{actionHref && <Link href={actionHref} className={cls}>{actionLabel}</Link>}{onAction && <button type="button" onClick={onAction} className={cls}>{actionLabel}</button>}</div>
  );
}