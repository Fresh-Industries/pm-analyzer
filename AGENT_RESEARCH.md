# Deep Research: Building Product Builder Agents

## Executive Summary

This research synthesizes Anthropic's engineering guidance on building effective agents and Google's A2A (Agent-to-Agent) protocol for multi-agent communication. Combined with our current tech stack, we have a clear path to building the Product Builder Agents system.

---

## Part 1: Anthropic's Research - Building Effective Agents

### Key Insights from Anthropic

**Source:** https://www.anthropic.com/research/building-effective-agents

#### The Spectrum: Workflows vs. Agents

| Workflows | Agents |
|----------|--------|
| Predefined code paths | Dynamic, LLM-directed |
| Predictable, consistent | Flexible, adaptive |
| Good for known tasks | Good for open-ended problems |
| Lower latency/cost | Higher latency/cost |

**Recommendation:** Start with the simplest solution. Only add agentic complexity when simpler approaches fail.

#### The 5 Workflow Patterns

**1. Prompt Chaining**
```
Input → LLM1 → LLM2 → LLM3 → Output
```
Best for: Tasks that decompose cleanly into steps
Example: Generate marketing copy → Translate → Proofread

**2. Routing**
```
Input → Classifier → Specialized LLM → Output
```
Best for: Distinct categories handled differently
Example: Easy questions → Haiku | Hard questions → Sonnet

**3. Parallelization**
```
Input → [LLM1, LLM2, LLM3] → Aggregate → Output
```
Best for: Independent subtasks or diverse perspectives
Example: Multiple code reviewers → Vote on issues

**4. Orchestrator-Workers**
```
Orchestrator → Worker1, Worker2, Worker3 → Synthesize → Output
```
Best for: Complex tasks with unpredictable subtasks
Example: Coding changes across multiple files

**5. Evaluator-Optimizer**
```
Generate → Evaluate → Refine → ... → Output
```
Best for: Tasks with clear improvement criteria
Example: Write → Critique → Rewrite → Approve

#### When to Use Actual Agents

Agents are appropriate when:
- Open-ended problems with unpredictable steps
- Can't hardcode a fixed path
- Trusted environment with proper guardrails
- Task requires many iterations

**Agent Structure:**
```
1. Human gives command/task
2. Agent plans independently
3. Agent executes with tools
4. Agent pauses for checkpoints/human feedback
5. Task completes or hits stopping condition
```

#### Core Principles for Agent Design

1. **Maintain simplicity** - Don't overengineer
2. **Prioritize transparency** - Show agent's planning steps
3. **Craft excellent tools** - Good ACI (Agent-Computer Interface) is crucial

#### Tool Design Best Practices

Anthropic found they spent MORE time optimizing tools than prompts:

**Good tool characteristics:**
- Use natural formats (markdown, not escaped JSON)
- Require minimal mental overhead
- Include examples and edge cases
- Use absolute paths (not relative)
- Poka-yoke (harder to misuse)

**Example - Good vs Bad:**

❌ BAD - Diff format with line counting:
```json
{
  "tool": "edit_file",
  "diff": "<<<<<<< SEARCH\nline 1\nline 2\n=======\nline 1\nline 2 modified\n>>>>>>> REPLACE"
}
```

✅ GOOD - Simple replacement:
```json
{
  "tool": "replace_text",
  "file": "/absolute/path/file.ts",
  "old_text": "const old = 'value'",
  "new_text": "const new = 'better'"
}
```

---

## Part 2: Google's A2A Protocol

### What is A2A?

**Source:** https://github.com/a2aproject/A2A

A2A is an **open protocol** (under Linux Foundation) for agent-to-agent communication. It enables:
- Agent capability discovery
- Secure collaboration on long-running tasks
- Rich data exchange (text, files, JSON)
- Multiple interaction modes

### Key A2A Concepts

**1. Agent Cards (JSON)**
```json
{
  "name": "Research Agent",
  "description": "Researches markets and competitors",
  "capabilities": ["web_search", "web_fetch", "data_analysis"],
  "endpoint": "https://api.example.com/agents/research"
}
```

**2. Communication Patterns**

| Pattern | Use Case |
|---------|----------|
| Request/Response | Simple task handoff |
| Streaming (SSE) | Real-time progress |
| Push Notifications | Long-running tasks |

**3. Message Structure**
```json
{
  "messageId": "msg_123",
  "agentId": "research-agent",
  "action": "task_complete",
  "payload": {
    "research_results": { ... }
  },
  "timestamp": "2026-02-05T22:00:00Z"
}
```

### A2A vs MCP

| Protocol | Purpose |
|---------|---------|
| **A2A** | Agent ↔ Agent communication |
| **MCP** | Agent ↔ Tool/Service communication |

**They work together:**
```
Agent ←→ MCP → Tools (search, fetch, database)
Agent ←→ A2A → Other Agents
```

---

## Part 3: Architecture for Product Builder Agents

### Our System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     Product Builder Agents                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  RESEARCH   │───►│     SPEC    │───►│    BUILD    │        │
│  │   AGENT     │    │   AGENT    │    │   AGENT     │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│        │                  │                  │                  │
│        │    ┌────────────▼────────┐       │                  │
│        │    │   ORCHESTRATOR      │◄──────┘                  │
│        │    │   (A2A Protocol)   │                           │
│        │    └────────────────────┘                           │
│        │                  │                                     │
│        │    ┌────────────▼────────┐                          │
│        │    │     DASHBOARD        │                          │
│        │    │  (Human Oversight)  │                          │
│        │    └────────────────────┘                          │
│        │                  │                                     │
│        │    ┌────────────▼────────┐                          │
│        └────┤   FEEDBACK/ITERATE  │                          │
│             │      AGENT           │                          │
│             └─────────────────────┘                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Agent Patterns

| Agent | Pattern | Complexity |
|-------|---------|------------|
| Research | Orchestrator-Workers | Medium |
| Spec | Prompt Chaining | Low |
| Build | Agent (with tools) | High |
| Marketing | Prompt Chaining | Low |
| Feedback | Evaluator-Optimizer | Medium |
| Iterate | Orchestrator-Workers | Medium |

### Human-in-the-Loop Design

Following Anthropic's guidance:

```
┌──────────────────────────────────────────────────────────┐
│                    CHECKPOINTS                             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. User Input → OK to proceed?                          │
│                     ↓                                      │
│  2. Research Complete → Review findings?                  │
│                     ↓                                      │
│  3. Spec Complete → Approve architecture?               │
│                     ↓                                      │
│  4. Build Complete → Deploy to prod?                      │
│                     ↓                                      │
│  5. Marketing Complete → Launch?                           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Part 4: Implementation on Current Stack

### Current Tech Stack

| Layer | Technology | Agent Ready? |
|-------|------------|-------------|
| Frontend | Next.js 16 + React 19 | ✅ Yes |
| Backend | Next.js API Routes | ✅ Yes |
| Database | PostgreSQL + Prisma + pgvector | ✅ Yes |
| Auth | Better Auth | ✅ Yes |
| Styling | Tailwind + Shadcn UI | ✅ Yes |
| AI | OpenAI + Anthropic | ✅ Yes |

### What We Need to Add

**1. Agent Orchestration Layer**
```
lib/agents/
├── orchestrator.ts      # A2A-style communication
├── base-agent.ts       # Base class for all agents
└── messages.ts         # Message types
```

**2. Tool Definitions (MCP-style)**
```
lib/tools/
├── search.ts           # Web search
├── fetch.ts            # Web fetch
├── database.ts         # Prisma access
├── filesystem.ts       # File operations
└── github.ts          # GitHub API
```

**3. Agent Implementations**
```
agents/
├── research-agent/     # Phase 1
├── spec-agent/        # Phase 2
├── build-agent/       # Phase 3
├── marketing-agent/   # Phase 4
├── feedback-agent/    # Phase 5
└── iterate-agent/     # Phase 6
```

### Database Schema Updates

```prisma
model AgentTask {
  id            String   @id @default(cuid())
  agent         String   // "research", "spec", "build", etc.
  status        String   // "pending", "running", "waiting", "completed", "failed"
  input         Json
  output        Json?
  messages      Json?    // A2A message log
  checkpoint    String?  // Human approval checkpoint
  humanApproved Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([agent, status])
}
```

### A2A Message Format (Simplified)

```typescript
interface AgentMessage {
  id: string;
  from: 'research' | 'spec' | 'build' | 'marketing' | 'feedback' | 'iterate';
  to: string;
  action: 'task_request' | 'task_complete' | 'task_failed' | 'checkpoint' | 'approval';
  payload: Record<string, any>;
  timestamp: string;
}
```

---

## Part 5: Implementation Roadmap

### Phase 1: Foundation (This Week)

**1.1 Set up Agent Infrastructure**
- [ ] Create `lib/agents/` directory
- [ ] Implement base Agent class
- [ ] Create orchestrator for A2A-style messaging
- [ ] Define message types

**1.2 Build Tool Layer**
- [ ] Web search tool (Brave API)
- [ ] Web fetch tool
- [ ] Database query tool
- [ ] Test all tools

**1.3 Create Research Agent**
- [ ] Takes user request
- [ ] Uses search/fetch tools
- [ ] Returns market research
- [ ] Implement checkpoint

### Phase 2: Spec Agent (Week 2)

- [ ] Prompt chaining workflow
- [ ] PRD generation
- [ ] Tech stack selection
- [ ] Architecture design

### Phase 3: Build Agent (Week 3-4)

- [ ] Code generation tools
- [ ] GitHub integration
- [ ] Deployment pipeline
- [ ] Verification checks

### Phase 4: Marketing + Feedback (Week 5)

- [ ] Landing page generator
- [ ] Social media posting
- [ ] Sentiment analysis
- [ ] Feedback collection

### Phase 5: Iterate Agent (Week 6)

- [ ] Prioritization logic
- [ ] Improvement planning
- [ ] Loop back to Build Agent

---

## Part 6: Code Examples

### Base Agent Class

```typescript
// lib/agents/base-agent.ts
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export abstract class BaseAgent {
  name: string;
  description: string;
  
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
  
  abstract tools: Record<string, Function>;
  abstract systemPrompt: string;
  
  async run(input: Record<string, any>): Promise<any> {
    // Build context from previous messages
    // Generate response with tool calls
    // Execute tools
    // Return result
  }
}
```

### Orchestrator (Simplified A2A)

```typescript
// lib/agents/orchestrator.ts
import { AgentMessage } from './messages';

export class Orchestrator {
  private agents: Map<string, BaseAgent>;
  private messageLog: AgentMessage[];
  
  async send(from: string, to: string, action: string, payload: any) {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      from,
      to,
      action,
      payload,
      timestamp: new Date().toISOString(),
    };
    
    this.messageLog.push(message);
    
    // Send to target agent
    const targetAgent = this.agents.get(to);
    const response = await targetAgent.run({ ...payload, messageLog: this.messageLog });
    
    return response;
  }
  
  async requestCheckpoint(agent: string, checkpoint: string) {
    // Mark task as waiting for human approval
    await prisma.agentTask.update({
      where: { id: checkpoint },
      data: { status: 'waiting', checkpoint },
    });
  }
}
```

### Tool Definition (Anthropic Best Practices)

```typescript
// lib/tools/web-search.ts
export const webSearchTool = {
  name: 'web_search',
  description: `Search the web for information. Use this to find:
- Competitor products and pricing
- Market statistics and trends
- Customer reviews and pain points
  
Example: "dog walking SaaS competitors pricing"`,
  
  parameters: z.object({
    query: z.string().describe('The search query'),
    numResults: z.number().default(5),
  }),
  
  execute: async ({ query, numResults }: { query: string; numResults: number }) => {
    const response = await fetch(`https://api.brave.com/v1/web_search?q=${encodeURIComponent(query)}`, {
      headers: { 'X-Subscription-Token': process.env.BRAVE_API_KEY },
    });
    const data = await response.json();
    return data.web.results.slice(0, numResults);
  },
};
```

---

## Part 7: Key Resources

### Anthropic Resources
- **Building Effective Agents:** https://www.anthropic.com/research/building-effective-agents
- **Claude Agent SDK:** https://platform.claude.com/docs/en/agent-sdk/overview
- **Model Context Protocol:** https://modelcontextprotocol.io

### A2A Protocol
- **GitHub Repo:** https://github.com/a2aproject/A2A
- **Specification:** https://a2a-protocol.org/latest/specification/
- **JS SDK:** npm install @a2a-js/sdk

### Related
- **SWE-bench (Coding Agents):** https://www.anthropic.com/research/swe-bench-sonnet
- **Computer Use Demo:** https://github.com/anthropics/anthropic-quickstarts

---

## Summary: Ready to Build

### Key Takeaways

1. **Start Simple** - Use prompt chaining before full agents
2. **Tool Quality Matters** - Anthropic spent more time on tools than prompts
3. **Human Checkpoints** - Agents should pause at decision points
4. **A2A + MCP** - A2A for agent communication, MCP for tools
5. **Transparent** - Show users what agents are planning/doing

### Immediate Next Steps

1. ⬜ Create `lib/agents/` structure
2. ⬜ Implement web search/fetch tools
3. ⬜ Build Research Agent as proof of concept
4. ⬜ Add human checkpoint flow
5. ⬜ Test end-to-end

---

**Research completed: February 5, 2026**
**Sources: Anthropic Engineering Blog, Google A2A Protocol GitHub**
