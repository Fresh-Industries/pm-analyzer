# Feedback to Code Pipeline Research

## Executive Summary
For the "Feedback to Code" pipeline, we recommend a self-hosted **Formbricks** instance for survey collection and **OpenHands** (formerly OpenDevin) as the primary AI coding agent. Formbricks provides the specific product-focused feedback tools (NPS, feature requests) that raw form builders lack, while OpenHands offers the most robust API-driven "headless" agent experience for autonomous feature building.

## 1. Survey Builder Options

We analyzed options ranging from raw form libraries to full product feedback platforms.

### Recommendation: Formbricks (Self-Hosted)
**Why:** It is an open-source alternative to Qualtrics/Productboard built specifically for "Experience Management." Unlike generic form builders, it has built-in logic for identifying users and tracking where feedback comes from (URL, session).

| Option | Type | Pros | Cons |
|:---|:---|:---|:---|
| **Formbricks** | Open Source Platform | Native Next.js SDK, targeted user identification, built for "feedback" not just "forms", easy Docker self-hosting. | Less "visual customization" freedom than building from scratch. |
| **Typebot** | Chat Builder | Great conversational UI, high completion rates. | Better for "lead gen" or support flow than structured product feedback. |
| **React Hook Form** | Library | Infinite customization, zero cost. | You build everything (database, dashboard, analytics, auth) from scratch. |
| **Typeform** | SaaS | Industry standard UX. | Expensive at scale, data privacy concerns, no self-host option. |

**Integration Strategy:**
Use `formbricks-js` in the Next.js app. It injects a widget that can be triggered programmatically (e.g., `formbricks.track('feature-request')`) or via no-code targeting rules.

## 2. AI Coding Agents

The goal is an agent that can be triggered via API/CLI to plan and execute code changes without human hand-holding.

### Recommendation: OpenHands (Primary) or Claude Code (Lightweight)

| Agent | Headless/API Support | Strengths | Weaknesses |
|:---|:---|:---|:---|
| **OpenHands** | **Excellent** (SDK + REST API) | Designed for autonomous end-to-end dev. Can run in a secure sandbox (Docker). Persistent workspace state. | Heavy resource usage (requires Docker/containers). |
| **Claude Code** | **Good** (`-p` flag) | Official Anthropic tool. Fast, efficient, direct CLI usage. | Primarily a CLI tool for humans; "agentic" loops are less robust than OpenHands for long-running complex tasks. |
| **Aider** | **Good** (Python Scripting) | Best-in-class code editing precision. Scriptable via Python. | Focused on "pair programming" rather than "autonomous feature implementation." |
| **Cursor CLI** | **Poor** | Great IDE, but "headless" mode is limited for autonomous agentic workflows. | Meant for interactive use. |

**Winner:** **OpenHands** for the "Heavy Lifting" of building a feature. It exposes a clean API to start a session, give a prompt, and retrieve the result (PR).

## 3. Architecture & Workflows

### The "Feedback to Code" Pipeline

```mermaid
graph TD
    User[User] -->|Submits Feedback| Widget[Formbricks Widget]
    Widget -->|Webhook| IngestAPI[PM Analyzer Ingest API]
    IngestAPI -->|Job: Analyze| Queue[BullMQ (Redis)]
    
    subgraph "Background Workers"
        AnalyzerWorker[Analyzer Worker] -->|Categorize & Spec| DB[(Database)]
        AnalyzerWorker -->|If "Valid Feature"| SpecDoc[Generate Spec.md]
        SpecDoc -->|Job: Build Feature| AgentQueue[Agent Queue]
    end
    
    subgraph "AI Build Environment"
        AgentWorker -->|Trigger| OpenHands[OpenHands Instance]
        OpenHands -->|Clone Repo| Git[Git Workspace]
        OpenHands -->|Read Spec| Git
        OpenHands -->|Write Code| Git
        OpenHands -->|Run Tests| Git
        Git -->|Push Branch| GitHub[GitHub]
    end
    
    GitHub -->|Open PR| DevOps[DevOps Pipeline]
```

### Triggering Mechanics
1.  **Ingestion:** Formbricks webhook hits `POST /api/webhooks/feedback`.
2.  **Analysis:** Standard Node.js worker analyzes feedback. If it meets the threshold (e.g., "High Confidence Bug" or "Approved Feature"), it generates a structured `spec.md` file.
3.  **Agent Trigger:** The worker pushes a job to `agent-build-queue`.
4.  **Execution:** A specialized worker (running in an environment with Docker access) picks up the job and calls the OpenHands API:
    ```json
    {
      "task": "Implement the feature described in spec.md",
      "repo": "github.com/org/repo",
      "base_branch": "main"
    }
    ```

## 4. MVP Scope

**Phase 1: The "Fix It" Loop (Simpler than full features)**
1.  **Feedback:** User reports a specific bug via Formbricks widget.
2.  **Analysis:** PM Analyzer summarizes the bug report.
3.  **Agent:** OpenHands attempts to reproduce it (write a failing test) and fix it.
4.  **Output:** A Pull Request titled `fix: [Auto] Fix bug reported by user`.

**Phase 2: The Feature Builder**
1.  **Feedback:** Aggregated requests for "Dark Mode".
2.  **Spec:** PM Analyzer generates a technical spec for adding Dark Mode.
3.  **Agent:** OpenHands implements the spec across the codebase.

## 5. Tech Stack Recommendations

*   **Frontend/App:** Next.js 16 (Existing)
*   **Survey:** **Formbricks** (Self-hosted via Docker Compose alongside PM Analyzer)
*   **Queue:** **BullMQ** (Existing)
*   **Agent Runtime:** **OpenHands** (Running in a separate isolated container/VM for security)
*   **Database:** PostgreSQL (shared by PM Analyzer and Formbricks)
*   **Orchestration:** Docker Compose (for local/single-node) or Kubernetes (scaled).

## 6. Estimated Costs

**Per Feedback Analyzed:** ~$0.01 - $0.05 (LLM costs for categorization/summarization)
**Per Feature Built (Agent):**
*   **Small Fix (5-10 mins):** $0.50 - $2.00 (Claude 3.5/3.7 Sonnet tokens)
*   **Medium Feature (30-60 mins):** $5.00 - $15.00 (Heavy context window usage)

**Infrastructure:**
*   VPS for PM Analyzer + Formbricks: ~$20/mo
*   Agent Runner (High CPU/RAM for Docker-in-Docker): ~$40-80/mo (can be ephemeral/on-demand).

## 7. Competition Analysis

| Competitor | Their Approach | Our Differentiation |
|:---|:---|:---|
| **Productboard** | Collect feedback -> Manual Roadmap | **Feedback -> Code.** We don't just list the feature; we attempt to build the MVP. |
| **Canny** | Voting board -> Integrations | **Invisible Loop.** No "voting board" friction. Feedback flows directly to the codebase. |
| **Typeform** | Pretty forms -> Excel/Zapier | **Context Aware.** Our forms know *who* the user is and *what* they were doing when they complained. |

**Key Differentiator:** The "Action Gap". Competitors stop at *organizing* feedback. PM Analyzer *acts* on it.
