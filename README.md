# Wabi — AI WhatsApp Business Assistant

> Never miss another customer. Wabi answers your WhatsApp automatically — FAQs, prices, delivery, bookings — captures interested leads, and hands the hot conversations to you. Works in English & Urdu, free plan included.

![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![Next.js](https://img.shields.io/badge/Next.js-14.2-black) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8) ![Prisma](https://img.shields.io/badge/Prisma-5.22-green) ![License](https://img.shields.io/badge/License-MIT-brightgreen) ![Tests](https://img.shields.io/badge/tests-40%20passing-brightgreen)

---

## Why Wabi exists

Small businesses in Pakistan (and everywhere) lose sales to WhatsApp's dreaded single tick. Customers message at midnight asking about prices, delivery, or bookings — and nobody answers until 11am the next day,by which time they've ordered from the competitor.

Wabi is the assistant that never sleeps: it answers from **your** knowledge base (hours, prices, delivery, FAQs), captures contact details, **scores every lead**, and lets you take over any conversation when a human touch is needed.

## Features

- 🤖 **AI auto-replies 24/7** — knowledge-base-aware answers in English / Roman Urdu / Urdu
- 🧠 **Knowledge base manager** — add FAQs once; the AI answers from them
- 🎯 **Lead capture & scoring** — buying-intent detection, scores /20, auto-status: new → qualified → converted
- 💬 **Conversation inbox** — every chat with full history, AI vs human mode, close/reopen
- 🤝 **Human handoff** — take over any conversation in one click (Pro+), auto WhatsApp send
- 📊 **Dashboard** — overview stats, contacts/leads table, usage meters
- 💳 **Plan-based monetization** — Free / Pro / Growth tiers with per-plan limits & feature gates; Stripe-ready
- 📱 **Demo simulator** — try the full AI pipeline without a Meta account
- 🔐 **Security** — JWT sessions, bcrypt(12), rate limiting, per-user data scoping, env-only secrets

## Deployment status

**Still not deployed.** No live URL, and I'd rather say that plainly than paste a link
that 404s.

What's blocking it is credentials, not code. There's no Vercel token in this build
environment, and this app also needs a real Postgres (Neon or Supabase) plus Meta Cloud
API webhook values before it does anything useful — a deployment without them would load
and then sit there doing nothing.

The path is written down in `docs/deployment.md` and it's genuinely short: create the
database, set the six env vars from `.env.example`, import the repo on Vercel, point the
Meta webhook at `/api/webhook`. About ten minutes.

## License

MIT — see [LICENSE](LICENSE).

---

*Built with ☕ in Karachi. Open a PR, file an issue, or say salam — we read everything.*
