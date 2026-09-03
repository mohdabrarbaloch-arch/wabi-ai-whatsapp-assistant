"use client";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "../page";
import { Spinner } from "@/app/(auth)/login/login-form";

interface Item { id: string; question: string; answer: string; keywords: string; }

export default function KnowledgePage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");

  const load = useCallback(() => { setError(null); fetch("/api/knowledge").then(async (res) => { const d = await res.json(); if (!res.ok) throw new Error(d.error || "Failed to load knowledge base."); setItems(d.items); }).catch((e) => setError(e.message)); }, []);
  useEffect(load, [load]);

  function openNew() { setEditing(null); setQuestion(""); setAnswer(""); setKeywords(""); setFormError(null); setShowForm(true); }
  function openEdit(item: Item) { setEditing(item); setQuestion(item.question); setAnswer(item.answer); setKeywords(item.keywords); setFormError(null); setShowForm(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setFormError(null);
    const body = { question, answer, keywords };
    const res = editing ? await fetch(`/api/knowledge/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) : await fetch("/api/knowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setFormError(d.error || "Couldn't save this entry."); setSaving(false); return; }
    setSaving(false); setShowForm(false); load();
  }

  async function remove(item: Item) { if (!window.confirm(`Delete "${item.question}"?`)) return; const res = await fetch(`/api/knowledge/${item.id}`, { method: "DELETE" }); if (res.ok) load(); }

  if (error) return <EmptyState icon="⚠️" title="Couldn't load your knowledge base" desc={error} onAction={load} actionLabel="Retry" />;
  if (!items) return <div className="flex items-center justify-center py-24 text-slate-400"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm">Loading knowledge base…</span></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="heading-lg">Knowledge base</h1><p className="mt-1 text-slate-500">These are the answers Wabi gives your customers. The more you add, the smarter it gets. 🧠</p></div>
        <button onClick={openNew} className="btn-primary">+ Add FAQ</button>
      </div>
      {showForm && (
        <form onSubmit={save} className="card space-y-4 p-6">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">{editing ? "Edit entry" : "New FAQ entry"}</h2><button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-2 py-1 text-sm">✕</button></div>
          {formError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>}
          <div><label className="label">Question customers ask</label><input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Do you deliver?" required /></div>
          <div><label className="label">Your answer</label><textarea className="input resize-y" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Yes! We deliver across Karachi…" required /></div>
          <div><label className="label">Keywords <span className="font-normal text-slate-400">(comma-separated — helps matching when no AI key is set)</span></label><input className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="delivery, order, rider" /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add FAQ"}</button></div>
        </form>
      )}
      {items.length === 0 ? (
        <EmptyState icon="🧠" title="Your knowledge base is empty" desc="Add your most-asked questions (hours, prices, delivery, bookings). Wabi uses these to answer customers automatically." onAction={openNew} actionLabel="+ Add your first FAQ" />
      ) : (
        <div className="space-y-3">{items.map((item) => (<div key={item.id} className="card p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="font-semibold text-slate-900">{item.question}</p><p className="mt-1 text-sm leading-relaxed text-slate-600">{item.answer}</p>{item.keywords && <p className="mt-2 text-xs text-slate-400">Keywords: {item.keywords}</p>}</div><div className="flex shrink-0 gap-2"><button onClick={() => openEdit(item)} className="btn-secondary px-3 py-1.5 text-xs">Edit</button><button onClick={() => remove(item)} className="btn-danger px-3 py-1.5 text-xs">Delete</button></div></div></div>))}</div>
      )}
    </div>
  );
}