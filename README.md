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
- 🇵🇰 **Built for Pakistan** — PKR pricing, Asia/Karachi default timezone, WhatsApp-first UX

## Tech stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · React 18 · Tailwind CSS 3
- **Backend:** Next.js Route Handlers (REST) · Zod validation
- **Database:** Prisma 5 · SQLite (local dev) / PostgreSQL (production)
- **Auth:** JWT (jose) httpOnly cookies · bcrypt password hashing
- **AI:** Provider abstraction — OpenAI · Gemini · offline keyword engine (no keys needed)
- **Channel:** Meta WhatsApp Cloud API (send + webhook) · built-in simulator
- **Billing:** Usage metering + Stripe checkout/webhook (env-configured, optional)

## Quick start (local)

```bash
# 1. clone & install
git clone https://github.com/mohdabrarbaloch-arch/wabi-ai-whatsapp-assistant.git && cd wabi-ai-whatsapp-assistant
npm install

# 2. configure env
cp .env.example .env   # fill AUTH_SECRET; DATABASE_URL defaults to SQLite

# 3. create db + seed demo data
npm run db:push
npm run db:seed        # demo@wabi.app / demo1234

# 4. run
npm run dev            # http://localhost:3000
```

Log in with the demo account and open **Try Live Demo** in the dashboard — send a customer message and watch the AI answer, capture the lead and update the score.

## Demo account

| | |
|---|---|
| Email | `demo@wabi.app` |
| Password | `demo1234` |
| Business | Cafe Gulzar (sample FAQs: hours, delivery, cakes, events) |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server on :3000 |
| `npm run build` | generate Prisma client + production build |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests (40) |
| `npm run db:push` | sync SQLite/Postgres schema |
| `npm run db:seed` | seed the demo account |
| `npm run pg:gen` | emit the Postgres variant of the schema |

## Project structure

```
app/
  (auth)/login, register     # auth pages + client forms
  api/                       # REST route handlers
    auth/                    # register, login, logout, me
    billing/                 # usage, upgrade, webhook (Stripe)
    conversations/[id]/      # thread, reply, status, summary
    contacts/  dashboard/  knowledge/  settings/  meta/
    wa/                      # webhook (Meta) + simulator
  dashboard/                 # overview, inbox, contacts, KB, billing, settings, simulator
  page.tsx pricing privacy terms contact   # marketing + legal
  sitemap.ts robots.ts icon.svg            # SEO
components/
  marketing/  dashboard/     # navbar/footer + app shell (responsive sidebar)
lib/
  ai/provider.ts             # OpenAI / Gemini / offline engine (abstraction)
  pipeline.ts                # inbound message → reply → lead scoring
  leads.ts billing.ts session.ts password.ts rate-limit.ts
  constants.ts               # plans, limits, keyword banks
  validation.ts whatsapp.ts auth-guard.ts prisma.ts utils.ts
prisma/schema.prisma         # data model (SQLite + Postgres compatible)
tests/unit/                  # 40 unit tests
docs/                        # architecture, deployment, API, QA report
scripts/                     # prepare-db, pg-schema generator
```

## Deployment & WhatsApp & Stripe

Full walkthrough in **[docs/deployment.md](docs/deployment.md)**:
Vercel + Neon/Supabase Postgres, Meta Cloud API webhook setup, Stripe checkout/webhook.
The production build passes locally (40/40 unit tests + full runtime QA suite) — see
**[docs/QA_REPORT.md](docs/QA_REPORT.md)**. Live deployment from this machine was not
possible (no Vercel/CI credentials in the build sandbox) — deployment is a ~10 minute
click-through on Vercel with the env vars documented in `.env.example`.

## License

MIT — see [LICENSE](LICENSE).

---

*Built with ☕ in Karachi. Open a PR, file an issue, or say salam — we read everything.*
