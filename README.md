# CoachFlow AI

AI-powered **Lead Qualification & Appointment Automation** system for Business & Executive Coaching.

## Live Demo

**https://controlflow.27.jugaar.ai**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@coachflow.ai` | `admin123` |

---

## What It Does

CoachFlow AI engages website visitors in natural conversation, qualifies them against defined criteria, answers FAQs from a knowledge base, books discovery calls on your Google Calendar, sends automated emails, and feeds everything into a CRM-ready dashboard — no manual intervention needed.

### AI Workflow

```
Visitor → Greeting → Knowledge Base Search → Answer Questions
  → Collect Contact Info → Lead Qualification → Lead Scoring (HOT/WARM/COLD)
  → Book Appointment (Google Calendar) → Update CRM → Send Confirmation Email
  → Notify Coach → Human Handoff (when needed)
```

## Features

- **AI Chat Assistant** — floating chat widget powered by OpenRouter (`openai/gpt-oss-20b:free`)
- **Lead Qualification** — extracts name, email, phone, company, role, industry, revenue, goals, challenges, budget, timeframe
- **Lead Scoring** — 0-100 algorithm across 6 factors (industry fit, budget, timeframe, need clarity, decision role, engagement)
  - `80+` **HOT** (call-ready) · `50-79` **WARM** (nurture) · `0-49` **COLD** (not ready)
- **Google Calendar Booking** — availability detection, slot picker, event creation with Google Meet link
- **Email Automation** — 6 branded templates (Welcome, Confirmation, Reminder, Thank You, Follow-up, Nurture) triggered automatically
- **Human Handoff** — flagged when visitor requests a person, custom pricing, or complex queries
- **Knowledge Base** — full CRUD for FAQs that the AI searches at query time
- **Analytics Dashboard** — leads over time, source breakdown, qualification funnel, conversion rate
- **Auth** — NextAuth v5 with credential login for coaches/admins

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, shadcn/ui |
| AI | OpenRouter (`openai/gpt-oss-20b:free`) |
| Database | PostgreSQL via Prisma 7 + @prisma/adapter-pg |
| Scheduling | Google Calendar API (service account) |
| Email | Nodemailer (Gmail SMTP) |
| Auth | NextAuth v5 (JWT) |
| Hosting | pm2 + Caddy (auto SSL) |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env   # fill in your credentials

# 3. Generate Prisma client & create tables
npx prisma generate

# 4. Seed the database (admin user + KB entries + demo leads)
npm run seed

# 5. Run in development
npm run dev

# 6. Production build
npm run build && npm run start
```

### Google Calendar Setup

1. Create a Google Cloud project and enable the **Calendar API**
2. Create a **Service Account** and download the JSON key
3. Share your Google Calendar with the service account email (`Make changes to events`)
4. Add the key values to `.env`

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page + chat widget
│   ├── login/page.tsx            # Admin login
│   ├── dashboard/                # Auth-protected admin panel
│   │   ├── page.tsx              # Overview stats
│   │   ├── leads/                # Lead table + detail w/ transcripts
│   │   ├── appointments/         # Booking calendar + upcoming calls
│   │   ├── analytics/            # Charts & metrics
│   │   ├── knowledge-base/       # FAQ CRUD
│   │   └── settings/             # Prompts, rules, integrations
│   └── api/
│       ├── chat/                 # AI conversation + qualification
│       ├── leads/                # Lead CRUD
│       ├── appointments/         # Calendar booking
│       ├── calendar/slots/       # Availability
│       ├── email/trigger/        # Email sequences
│       ├── knowledge-base/       # KB CRUD
│       └── analytics/            # Stats aggregation
├── components/
│   ├── chat/ChatWidget.tsx       # Floating AI chat
│   └── dashboard/                # Dashboard components
├── lib/
│   ├── ai.ts                     # OpenRouter client
│   ├── prompts.ts                # System & qualification prompts
│   ├── knowledge-base.ts         # KB search + context injection
│   ├── lead-scoring.ts           # HOT/WARM/COLD algorithm
│   ├── calendar.ts               # Google Calendar client
│   ├── email.ts                  # SMTP + email templates
│   └── auth.ts                   # NextAuth config
└── generated/prisma/             # Prisma client
```

## License

Private project.
