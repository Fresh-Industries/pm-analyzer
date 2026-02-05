# PM Analyzer - Product Requirements Document

## V1 Vision: Decision & Handoff Tool

PM Analyzer V1 is a **decision and handoff tool**, not an execution tool. Its job is to turn messy customer evidence into clear answers to "what should we build next, and why," and then pass that work to tools like Linear, Slack, or Cursor.

**It does NOT execute work or ship code.**

---

## What PM Analyzer V1 Does

### Core Workflow
1. **Upload Evidence** — Paste text, upload docs, or import CSVs of customer feedback
2. **AI Analysis** — Clusters feedback into problems, extracts key quotes, states confidence/uncertainty
3. **Prioritize** — See ranked opportunities with evidence, reasoning, and tradeoffs
4. **Decision Doc** — Generate editable document with scope, AC, risks, non-goals, confidence
5. **Handoff** — One-click copy for Linear/Slack/Cursor
6. **History** — Track all decisions and why they were made

### V1 Features
- ✅ Evidence upload (text, CSV, docs)
- ✅ AI clustering and analysis
- ✅ Ranked opportunities with evidence
- ✅ Decision document generator
- ✅ Handoff to Linear/Slack/Cursor
- ✅ Decision history tracking
- ✅ Simple embedded surveys (1-3 questions)

### V1 Exclusions (Not Building)
- ❌ Auto-coding or PR creation
- ❌ Analytics dashboards
- ❌ Full roadmaps
- ❌ Competitor research
- ❌ Sentry integration
- ❌ Embeddable widgets

---

## V1 Success Criteria

A user succeeds with PM Analyzer V1 if, after 1-2 weeks:
1. They upload **real customer evidence**
2. They make **at least one real product decision**
3. They hand off the work **with more confidence than gut instinct alone**

---

## User Stories

**As a PM, I want to:**
- Upload customer evidence from multiple sources
- See AI-synthesized problems with customer quotes
- Get clear ranked opportunities with tradeoffs
- Generate a decision document for stakeholders
- Copy implementation briefs to Cursor/Claude Code
- Track my decision history over time

---

## Technical Notes

### Evidence Input
- Plain text paste
- CSV upload (source, text, tier, revenue columns)
- Doc upload (Markdown, PDF, TXT)

### AI Analysis
- Classify as bug/feature/question
- Cluster similar feedback into themes
- Extract representative quotes
- Score confidence (high/medium/low)

### Decision Document Structure
- Problem statement
- Scope (what's included)
- Acceptance criteria
- Risks and mitigations
- Non-goals (what's excluded)
- Confidence level
- Linked evidence

### Handoff Outputs
- **Linear**: Copy issue text
- **Slack**: Copy summary for stakeholders
- **Cursor**: Copy implementation brief with AC

---

## Tech Stack (V1)
- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Better Auth
- **AI**: OpenAI (GPT-4o for analysis, configurable model)

### What's Removed for V1
- ~~pgvector~~ (too complex for V1)
- ~~Stripe~~ (no payments in V1)
- ~~BullMQ queues~~ (no background processing needed)
- ~~Sentry integration~~ (cut for V1)
