# Agent UX Research - Multi-Agent System Interface Design 2026

## Executive Summary

Research on UX patterns for multi-agent systems. Key findings:
- **A2UI** (Google) - Standard for agent-generated UIs
- **Supervisor-Worker** pattern from AWS
- **Human-in-the-loop** controls essential
- **Trust** through transparency and auditability

---

## Part 1: The Agentic UX Framework

### Core Capabilities (UX Magazine)

Four pillars of agentic UX design:

| Pillar | Description | UX Implication |
|--------|-------------|----------------|
| **Perception** | How agents sense environment | Status indicators, live feeds |
| **Reasoning** | How agents think/decide | Show reasoning, decision points |
| **Memory** | How agents remember | Context preservation, history |
| **Agency** | How agents act | Controls, approvals, feedback |

### Key Insight

> "Agents are compelling, economical, and allow for a much more natural and flexible human-machine interface, where the Agents fill the gaps left by a human and vice versa, literally becoming a mind-meld of human and machine, a super-human 'Augmented Intelligence.'"

---

## Part 2: Supervisor-Worker Pattern (AWS)

### The Multi-Stage Agentic Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPERVISOR AGENT                              │
│   (leads investigation, coordinates workers)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │  Worker  │   │  Worker  │   │  Worker  │
      │ Agent 1 │   │ Agent 2  │   │ Agent 3 │
      └──────────┘   └──────────┘   └──────────┘
```

### The Investigation Flow (5 Steps)

| Step | Actor | Action |
|------|-------|--------|
| 1 | Human | Launches investigation, provides context |
| 2 | Supervisor | Spawns worker agents to investigate |
| 3 | Workers | Return "suggested observations" |
| 4 | Human | Accepts/rejects observations |
| 5 | Supervisor | Delivers hypothesis + next steps |

### AWS Dashboard Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  LEFT PANEL                    │  RIGHT PANEL                  │
│  Investigation Case File       │  Agent Suggestions             │
│                                │                               │
│  • Evidence collected         │  • Observation 1 [ACCEPT]      │
│  • Root cause hypothesis      │  • Observation 2 [ACCEPT]      │
│  • Next steps                │  • Observation 3 [ACCEPT]      │
│                                │                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 3: A2UI (Google's Agent UI Protocol)

### What is A2UI?

A2UI is an **open standard** for agents to generate UI:
- JSON format for component trees
- Security-first (declarative, not executable)
- Framework-agnostic (React, Flutter, etc.)
- Incrementally updateable

### Problem A2UI Solves

```
Text-only (inefficient):
User: "Book table for 2"
Agent: "What day?"
User: "Tomorrow"
Agent: "What time?"
... (来回 10+ messages)

A2UI (efficient):
Agent: [Date picker + Time selector + Submit button]
User: Selects date/time → Clicks submit
```

### A2UI Core Principles

| Principle | Description |
|-----------|-------------|
| **Security first** | Declarative data, not code |
| **LLM-friendly** | Flat component list, easy to generate |
| **Incrementally updateable** | Progressive rendering |
| **Framework-agnostic** | JSON → React, Flutter, etc. |
| **Client controls styling** | Native look and feel |

### A2UI Component Example

```json
{
  "components": [
    {
      "type": "card",
      "id": "booking-card",
      "children": [
        {
          "type": "date-picker",
          "id": "date",
          "label": "Select Date"
        },
        {
          "type": "time-selector",
          "id": "time",
          "options": ["5:00", "5:30", "6:00"]
        },
        {
          "type": "button",
          "id": "submit",
          "label": "Book Now"
        }
      ]
    }
  ]
}
```

---

## Part 4: Agent Dashboard Design Patterns

### Essential UI Components

| Pattern | Purpose | Example |
|---------|---------|----------|
| **Start/Stop/Pause** | Control agent flow | [▶️ Start] [⏸ Pause] [⏹ Stop] |
| **Progress indicator** | Show work in progress | Spinner, progress bar, steps |
| **Evidence panel** | Agent findings | "Observation 1: Database spike" |
| **Hypothesis card** | Agent conclusion | "Root cause: Memory leak" |
| **Action buttons** | Human decisions | [Accept] [Reject] [Modify] |
| **Audit log** | Track decisions | "User accepted observation 3" |

### Status States

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENT STATUS                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🟢 Running      - Agent actively working                        │
│  🟡 Waiting     - Waiting for human input                      │
│  🔴 Failed      - Error occurred                               │
│  ⚪ Completed    - Task finished                                │
│  🟣 Paused      - User paused                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Human-in-the-Loop Controls

```
┌─────────────────────────────────────────────────────────────────┐
│  CONTROLS                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [▶️ Start Workflow]                                            │
│                                                                 │
│  During execution:                                               │
│  [⏸ Pause]  [⏹ Stop]  [🔄 Retry]  [⚙️ Configure]           │
│                                                                 │
│  At checkpoints:                                                 │
│  [✅ Approve]  [❌ Reject]  [✏️ Modify]  [💬 Add Feedback]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 5: Trust Through Transparency

### What Builds Trust

| Factor | UI Implementation |
|--------|-------------------|
| **Show reasoning** | "Analyzing competitors..." → "Found 5 competitors" |
| **Show sources** | "Based on: [source 1], [source 2]" |
| **Explain decisions** | "Chosen because: [rationale]" |
| **Auditability** | Complete log of all agent actions |
| **Reversibility** | Easy to undo agent actions |
| **Control** | Human approval required for critical actions |

### Transparency Checklist

- [ ] Show agent thinking process
- [ ] Display confidence levels
- [ ] Highlight uncertainty
- [ ] Allow questionasking ("Why did you do that?")
- [ ] Provide alternative options
- [ ] Show tradeoffs considered

---

## Part 6: Multi-Agent Communication UX

### Agent Handoff Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENT HANDOFF                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  From: Research Agent                                           │
│  To:   Marketing Agent                                          │
│                                                                 │
│  Context passed:                                                │
│  • Market size: $5B                                            │
│  • Competitors: 5 found                                         │
│  • Opportunities: 3 identified                                   │
│                                                                 │
│  [View transferred context]                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Orchestrator Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR DASHBOARD                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ACTIVE WORKFLOWS                                       │  │
│  │  • Create Landing Page [▶️] [⏹]                         │  │
│  │  • Full Product Launch [⏸]                              │  │
│  │  • Generate Marketing Assets [✅]                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  AGENT STATUS                                           │  │
│  │  🟢 Research: Running (Analyzing competitors...)       │  │
│  │  🟡 Marketing: Waiting (Needs research complete)       │  │
│  │  🔴 Build: Failed (OpenHands timeout)                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  RECENT ACTIVITY                                        │  │
│  │  • Marketing requested research from Research            │  │
│  │  • Build completed landing page code                      │  │
│  │  • Research found 5 competitors                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 7: Error Handling UX

### Agent Failure States

| State | UX | Action |
|-------|-----|--------|
| **Soft failure** | Warning icon + message | "Some results may be incomplete" |
| **Hard failure** | Error icon + retry button | "Task failed. [Retry]?" |
| **Stuck** | Timeout + manual override | "No progress for 5 min. [Force continue]?" |
| **Conflicting** | Alert + comparison | "Agents disagree. [View conflicts]" |

### Error Recovery UX

```
┌─────────────────────────────────────────────────────────────────┐
│  ERROR RECOVERY                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ❌ Build Agent Failed                                          │
│                                                                  │
│  Error: OpenHands timeout after 10 minutes                     │
│                                                                  │
│  Possible causes:                                               │
│  • Too complex specification                                     │
│  • OpenHands service unavailable                                 │
│  • Network timeout                                              │
│                                                                  │
│  Actions:                                                        │
│  [🔄 Retry Build]    [✂️ Simplify Spec]    [📋 View Logs]      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 8: Progressive Disclosure

### Information Hierarchy

```
LEVEL 1: Always Visible
├── Agent status (running/waiting/failed)
├── Current workflow progress
└── Primary action button

LEVEL 2: On Expand
├── Agent logs (collapsed by default)
├── Context being used
└── Recent decisions

LEVEL 3: On Request
├── Full reasoning trace
├── Alternative options considered
├── Performance metrics
└── Debug information
```

---

## Part 9: Recommended Agent Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  [Logo] [Project Name] [User] [Settings]                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ORCHESTRATOR CONTROLS                                    │  │
│  │  [▶️ Start Workflow] [⏸ Pause All] [⏹ Stop All]        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │  ACTIVE AGENTS            │  │  WORKFLOW PROGRESS      │   │
│  │                          │  │                          │   │
│  │  🟢 Research  [●●●]      │  │  ┌──────────────────┐   │   │
│  │  🟢 Marketing [●○○]      │  │  │████████░░░░░░░░░  │   │   │
│  │  🟡 Build    [●○○]      │  │  └──────────────────┘   │   │
│  │  🔴 Feedback [○○○]       │  │  45% complete           │   │
│  │                          │  │                          │   │
│  │  [Expand] [Configure]    │  │  [View Details]          │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AGENT CONVERSATION / LOGS                                │  │
│  │                                                          │  │
│  │  📤 Research → Marketing: "Market analysis complete"     │  │
│  │  📥 Marketing → Build: "Generate landing page code"       │  │
│  │  📤 Build → OpenHands: "Build landing page"               │  │
│  │  📥 OpenHands → Build: "Deployed to Vercel"              │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CHECKPOINTS REQUIRING APPROVAL                          │  │
│  │                                                          │  │
│  │  ⚠️  Marketing wants to publish to dogwalker.com         │  │
│  │      [✅ Approve] [❌ Reject] [✏️ Modify]               │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 10: Implementation Recommendations

### For PM Analyzer Dashboard

| Current State | Recommended State |
|---------------|------------------|
| Static project pages | Live dashboard with agent status |
| No agent visibility | Real-time agent activity feed |
| Manual workflow | Orchestrated workflows with controls |
| No checkpoints | Human-in-the-loop approval points |
| Single agent | Multi-agent collaboration view |

### Quick Wins

1. **Add agent status badges** to project pages
2. **Show workflow progress** bar
3. **Add start/stop controls**
4. **Display recent agent messages**
5. **Add checkpoint approval UI**

### Medium-term

1. **A2UI integration** for dynamic component rendering
2. **Full orchestrator dashboard**
3. **Agent communication timeline**
4. **Error recovery UI**
5. **Audit log viewer**

---

## Part 11: Resources

### Official Documentation
- **A2UI (Google):** https://github.com/google/A2UI/
- **A2A Protocol:** https://a2a-protocol.org
- **AG UI:** https://ag-ui.com/

### Articles
- **UX Magazine:** https://uxmag.com/articles/secrets-of-agentic-ux
- **AWS Re:Invent:** https://www.youtube.com/watch?v=COP322

### Design Systems
- **Agentic Design Patterns:** https://agentic-design.ai/patterns/ui-ux-patterns
- **Agentic AI Design:** https://www.aufaitux.com/blog/agentic-ai-design-patterns-guide/

---

## Summary

### Key Takeaways

1. **Supervisor-Worker** pattern is proven (AWS)
2. **A2UI** is the emerging standard for agent UI
3. **Human-in-the-loop** is essential for trust
4. **Transparency** builds confidence
5. **Progressive disclosure** prevents overwhelm

### Dashboard Must-Haves

| Component | Purpose |
|-----------|---------|
| Start/Stop/Pause | Control agent execution |
| Progress indicator | Show work in progress |
| Evidence panel | Display agent findings |
| Checkpoint approvals | Human decisions required |
| Audit log | Track all actions |
| Error recovery | Handle failures gracefully |

---

**Research completed:** February 6, 2026  
**Sources:** UX Magazine, Google A2UI, AWS Re:Invent, AufaitUX
