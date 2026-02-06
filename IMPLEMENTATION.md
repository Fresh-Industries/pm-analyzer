# Product Builder Agents - Implementation Plan

## Project Structure
```
pm-analyzer/
├── agents/
│   ├── research-agent/     # Market/competitor research
│   ├── spec-agent/         # PRD, tech stack, architecture
│   ├── build-agent/        # Code generation, deployment
│   ├── marketing-agent/    # Landing page, launch copy
│   ├── feedback-agent/     # Sentiment analysis, feedback collection
│   └── iterate-agent/      # Prioritization, improvement planning
├── a2a/                    # Agent-to-Agent communication protocol
├── dashboard/               # Human oversight UI
└── api/                    # Backend APIs
```

## Phase 1: Research Agent

### What It Does
1. Takes user request ("Build a SaaS for dog walkers")
2. Researches the market
3. Analyzes competitors
4. Identifies opportunities
5. Outputs: Research report

### API Design

**POST /api/agents/research**
```json
{
  "request": "Build a SaaS for dog walkers",
  "constraints": {
    "budget": "low",
    "timeline": "2 weeks",
    "tech_preference": "typescript"
  }
}
```

**Response:**
```json
{
  "research": {
    "market_size": "$X billion",
    "competitors": [
      {"name": "Rover", "features": [...], "pricing": "$X/mo"},
      {"name": "Wag", "features": [...], "pricing": "$X/mo"}
    ],
    "opportunities": [
      "Niche: small business dog walkers",
      "Feature: GPS tracking",
      "Feature: Client communication"
    ],
    "risks": [
      "High competition",
      "Market saturation"
    ],
    "recommendations": [
      "Focus on a specific niche",
      "Start with core booking features"
    ]
  }
}
```

### Tools Used
- Web search (Brave API)
- Web fetch (for competitor websites)
- LLM analysis (OpenAI/Anthropic)

## Phase 2: Spec Agent

### What It Does
1. Takes research output
2. Creates PRD
3. Chooses tech stack
4. Designs architecture
5. Outputs: Complete spec

### Output Structure
```markdown
# Product: Dog Walker SaaS

## Problem
Dog walkers need better tools to manage clients, bookings, and payments.

## Solution
All-in-one platform for dog walking businesses.

## Features (MVP)
1. Client management
2. Booking system
3. Payment processing

## Tech Stack
- Frontend: Next.js + React
- Backend: Node.js + Prisma
- Database: PostgreSQL
- Auth: Clerk
- Payments: Stripe

## Architecture
[Diagram]

## API Design
[Endpoints]

## File Structure
[Folder structure]
```

## Phase 3: Build Agent

### What It Does
1. Takes spec
2. Creates GitHub repo
3. Generates code
4. Deploys to Vercel/Railway
5. Outputs: Live URL

## Phase 4: Marketing Agent

### What It Does
1. Creates landing page
2. Writes launch copy
3. Posts on Product Hunt
4. Posts on Twitter/X
5. Creates email campaign

## Phase 5: Feedback Agent

### What It Does
1. Monitors Product Hunt comments
2. Monitors Twitter mentions
3. Collects user feedback
4. Analyzes sentiment

## Phase 6: Iterate Agent

### What It Does
1. Prioritizes feedback
2. Creates improvement plan
3. Triggers Build Agent

## A2A Protocol

Agents communicate via structured messages:

```typescript
interface AgentMessage {
  from: string;        // "research-agent"
  to: string;         // "spec-agent"
  action: string;     // "research_complete"
  payload: any;
  timestamp: string;
}
```

## Dashboard

Human can:
- See all agent activity in real-time
- Approve/reject decisions
- Intervene when needed
- View conversation logs

## Next Actions

1. ⬜ Set up agent structure in repo
2. ⬜ Implement Research Agent
3. ⬜ Set up A2A communication
4. ⬜ Build dashboard UI
5. ⬜ Test end-to-end flow
