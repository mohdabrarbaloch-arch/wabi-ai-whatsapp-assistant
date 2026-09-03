import type { Metadata } from "next";
import Link from "next/link";
import { Navbar, Footer, Logo } from "@/components/marketing/nav";

export const metadata: Metadata = { title: "AI WhatsApp Assistant for Small Business" };

const features = [
  { icon: "⚡", title: "Replies in seconds, 24/7", desc: "Your customers get instant answers at 2pm or 2am — opening hours, prices, delivery, bookings. You sleep, Wabi works." },
  { icon: "🧠", title: "Knows your business", desc: "Feed it your FAQs and menu once. Wabi answers from YOUR knowledge base — not generic chatbot fluff." },
  { icon: "🎯", title: "Captures & scores leads", desc: "Spot the 'how much?' and 'do you deliver?' messages instantly. Every interested customer is flagged and scored for you." },
  { icon: "💬", title: "English & Urdu ready", desc: "Customers write in Roman Urdu, Urdu, or English — Wabi replies in the same language, naturally." },
  { icon: "🤝", title: "Human handoff", desc: "When a customer needs a real person, take over the chat in one click. Wabi hands over the full context." },
  { icon: "📊", title: "A dashboard you'll actually open", desc: "Every conversation, contact, lead score, and AI usage — clean, mobile-friendly, no training needed." },
];

const steps = [
  { n: "01", title: "Create your free account", desc: "Sign up in under a minute. No credit card, no setup fee, no nonsense." },
  { n: "02", title: "Add your FAQs & business info", desc: "Paste your common questions and answers — or let the demo data show you how it works." },
  { n: "03", title: "Connect WhatsApp", desc: "Use the built-in simulator to test instantly, then connect your Meta Cloud API number for the real thing." },
  { n: "04", title: "Never miss a customer", desc: "Wabi answers, scores leads, and hands over hot conversations. You close the deal." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 50% at 70% 0%, rgba(37,160,110,0.12) 0%, rgba(255,255,255,0) 60%), radial-gradient(40% 40% at 15% 20%, rgba(15,23,42,0.05) 0%, rgba(255,255,255,0) 60%)" }} />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="badge mb-5 bg-brand-50 text-brand-700 ring-1 ring-brand-100">Made for WhatsApp-first businesses</span>
            <h1 className="heading-xl leading-[1.1]">
              Your customers message at midnight.
              <span className="block text-brand-600">Someone should answer.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Wabi is the AI assistant that answers your WhatsApp automatically — FAQs, prices, delivery, bookings — captures interested leads, and hands you the hot conversations. In English & Urdu.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary px-6 py-3 text-base">Start free — no card needed</Link>
              <Link href="/pricing" className="btn-secondary px-6 py-3 text-base">See pricing</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2"><span className="text-brand-600">✓</span> Free plan — 50 AI replies/month</span>
              <span className="flex items-center gap-2"><span className="text-brand-600">✓</span> 2-minute setup</span>
              <span className="flex items-center gap-2"><span className="text-brand-600">✓</span> No credit card</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">🎂</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Cafe Gulzar</p>
                  <p className="text-xs text-emerald-600">● online — replies instantly</p>
                </div>
              </div>
              <div className="space-y-2.5 py-4 text-sm">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-slate-100 px-3.5 py-2.5 text-slate-700">Hi! Do you do custom birthday cakes? 🎂</div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-brand-600 px-3.5 py-2.5 text-white">Hi Ayesha! Yes we do 🎂 Custom theme cakes start at PKR 3,500. Our signature chocolate fudge (1kg) is PKR 2,500 — want a quote for a specific design?</div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-slate-100 px-3.5 py-2.5 text-slate-700">Yes please! And do you deliver to DHA? 🏍️</div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-brand-600 px-3.5 py-2.5 text-white">We do — delivery inside DHA is PKR 100, free over PKR 500. I&apos;ve noted your order idea, a team member will confirm the design & date with you shortly 😊</div>
                <div className="flex justify-end"><span className="badge bg-amber-100 text-amber-700">🎯 Lead scored: 9/20 · qualified</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="border-t border-slate-100 bg-slate-50/60 py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center"><h2 className="heading-xl">Everything a WhatsApp business needs</h2><p className="mt-3 text-slate-600">No separate apps. No complicated flows. Just your business, answering better.</p></div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{features.map((f) => (<div key={f.title} className="card p-6 transition hover:border-brand-200 hover:shadow-md"><div className="text-2xl">{f.icon}</div><h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.desc}</p></div>))}</div>
        </div>
      </section>
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center"><h2 className="heading-xl">Live in one evening</h2><p className="mt-3 text-slate-600">Seriously. Most owners are up and running before dinner.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">{steps.map((s) => (<div key={s.n} className="relative rounded-2xl border border-slate-200 p-6"><span className="text-4xl font-bold text-brand-100">{s.n}</span><h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3><p className="mt-1.5 text-sm text-slate-600">{s.desc}</p></div>))}</div>
          <div className="mt-12 text-center"><Link href="/register" className="btn-primary px-6 py-3">Try it free →</Link></div>
        </div>
      </section>
      <section className="bg-slate-900 py-16 text-center">
        <div className="container-page">
          <Logo className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Stop losing customers to &ldquo;seen&rdquo;</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">Every unanswered message is a sale walking to your competitor. Wabi answers them all — starting today.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-3 font-semibold text-white transition hover:bg-brand-400">Get started free</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}