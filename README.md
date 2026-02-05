# PM Analyzer — Decision & Handoff Tool

A "Cursor for PMs" SaaS that helps product managers turn messy customer feedback into clear decisions and hand off work to engineering.

## What It Does

PM Analyzer V1 is a **decision and handoff tool**, not an execution tool:

1. **Upload evidence** — Paste text, upload CSVs, or import docs
2. **Get AI analysis** — Problems clustered with customer quotes
3. **See ranked opportunities** — Evidence, reasoning, tradeoffs
4. **Generate decision doc** — Scope, AC, risks, non-goals, confidence
5. **Hand off** — Copy for Linear/Slack/Cursor
6. **Track history** — Remember decisions and why

## What It Doesn't Do

- ❌ Auto-code or create PRs
- ❌ Analytics dashboards
- ❌ Full roadmaps
- ❌ Competitor research
- ❌ Sentry/Intercom sync

## Quick Start

```bash
# Install dependencies
npm install

# Start databases
docker-compose up -d

# Push schema
npx prisma db push

# Run dev server
npm run dev
```

Visit http://localhost:3000

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
BETTER_AUTH_SECRET="generate with: openssl rand -base64 32"
OPENAI_API_KEY="sk-..."
```

## V1 Scope

PM Analyzer V1 succeeds if a PM uses it for 1-2 weeks, uploads real evidence, makes at least one real decision, and hands off with more confidence than gut instinct alone.

## Tech Stack

- Next.js 16, React 19, Tailwind CSS, shadcn/ui
- PostgreSQL with Prisma
- Better Auth for authentication
- OpenAI (GPT-4o) for analysis
