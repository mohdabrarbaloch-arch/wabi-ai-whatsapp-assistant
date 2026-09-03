"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/marketing/nav";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/conversations", label: "Conversations", icon: "💬" },
  { href: "/dashboard/contacts", label: "Contacts", icon: "👥" },
  { href: "/dashboard/knowledge", label: "Knowledge Base", icon: "🧠" },
  { href: "/dashboard/simulator", label: "Try Live Demo", icon: "📱" },
  { href: "/dashboard/billing", label: "Plan & Billing", icon: "💳" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function DashboardShell({ user, children }: { user: { name: string; email: string; plan: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* continue */ }
    router.push("/login");
    router.refresh();
  }

  const NavLinks = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
            <span aria-hidden="true">{item.icon}</span>{item.label}
          </Link>
        );
      })}
    </nav>
  );

  const PlanBadge = (
    <span className={`badge capitalize ${user.plan === "free" ? "bg-slate-100 text-slate-600" : user.plan === "pro" ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"}`}>{user.plan} plan</span>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
          <Logo className="h-8 w-8" />
          <div><Link href="/" className="font-bold text-slate-900">Wabi<span className="text-brand-600">.</span></Link><p className="text-[11px] leading-none text-slate-400">Business dashboard</p></div>
        </div>
        {NavLinks}
        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user.name}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div>
            {PlanBadge}
          </div>
          <button onClick={logout} disabled={loggingOut} className="btn-secondary w-full py-2 text-xs disabled:opacity-60">{loggingOut ? "Logging out…" : "Log out"}</button>
        </div>
      </aside>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900"><Logo className="h-7 w-7" />Wabi<span className="text-brand-600">.</span></Link>
        <div className="flex items-center gap-2">
          {PlanBadge}
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Toggle menu">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}</svg>
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center gap-2.5 border-b border-slate-100 px-5"><Logo className="h-7 w-7" /><span className="font-bold text-slate-900">Wabi dashboard</span></div>
            {NavLinks}
            <div className="border-t border-slate-100 p-4"><p className="mb-2 truncate text-sm font-semibold text-slate-800">{user.name}</p><button onClick={logout} className="btn-secondary w-full py-2 text-xs" disabled={loggingOut}>{loggingOut ? "Logging out…" : "Log out"}</button></div>
          </div>
        </div>
      )}
      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-8 lg:py-8"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}