"use client";
import { useEffect, useState } from "react";
import { EmptyState } from "../page";
import { Spinner } from "@/app/(auth)/login/login-form";
import { timeAgo } from "@/lib/utils";

interface Contact { id: string; waPhone: string; name: string | null; leadScore: number; leadStatus: string; lastMessageAt: string; _count: { conversations: number }; }
const statusColors: Record<string, string> = { new: "bg-slate-100 text-slate-600", qualified: "bg-amber-50 text-amber-700", converted: "bg-emerald-50 text-emerald-700", not_a_lead: "bg-rose-50 text-rose-600" };

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  function load() { setError(null); setContacts(null); fetch("/api/contacts").then(async (res) => { const d = await res.json(); if (!res.ok) throw new Error(d.error || "Failed to load contacts."); setContacts(d.contacts); }).catch((e) => setError(e.message)); }
  useEffect(load, []);
  if (error) return <EmptyState icon="⚠️" title="Couldn't load contacts" desc={error} onAction={load} actionLabel="Retry" />;
  if (!contacts) return <div className="flex items-center justify-center py-24 text-slate-400"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm">Loading contacts…</span></div>;
  const filtered = filter === "all" ? contacts : contacts.filter((c) => c.leadStatus === filter);
  const qualified = contacts.filter((c) => c.leadStatus === "qualified" || c.leadStatus === "converted").length;
  return (
    <div className="space-y-6">
      <div><h1 className="heading-lg">Contacts & leads</h1><p className="mt-1 text-slate-500">{contacts.length} total · <span className="font-medium text-amber-600">{qualified} qualified leads</span> — these are your hot ones 🔥</p></div>
      <div className="flex flex-wrap gap-2">{["all", "new", "qualified", "converted", "not_a_lead"].map((f) => (<button key={f} onClick={() => setFilter(f)} className={`badge cursor-pointer px-3 py-1.5 capitalize transition ${filter === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{f.replace("_", " ")}{f !== "all" && <span className="opacity-70">({contacts.filter((c) => c.leadStatus === f).length})</span>}</button>))}</div>
      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="Nothing here yet" desc={filter === "all" ? "Contacts appear automatically when customers message you." : `No contacts with status "${filter}".`} />
      ) : (
        <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-400"><tr><th className="px-5 py-3 font-medium">Contact</th><th className="px-5 py-3 font-medium">WhatsApp</th><th className="px-5 py-3 font-medium">Lead score</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Last active</th></tr></thead><tbody className="divide-y divide-slate-50">{filtered.map((c) => (<tr key={c.id} className="transition hover:bg-slate-50/60"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{(c.name || "+" + c.waPhone).charAt(0).toUpperCase()}</div><span className="font-medium text-slate-800">{c.name || "Unknown"}</span></div></td><td className="px-5 py-3.5 text-slate-500">+{c.waPhone}</td><td className="px-5 py-3.5"><span className="font-semibold text-slate-700">{c.leadScore}/20</span></td><td className="px-5 py-3.5"><span className={`badge ${statusColors[c.leadStatus] || statusColors.new}`}>{c.leadStatus.replace("_", " ")}</span></td><td className="px-5 py-3.5 text-slate-500">{timeAgo(c.lastMessageAt)}</td></tr>))}</tbody></table></div>
      )}
    </div>
  );
}