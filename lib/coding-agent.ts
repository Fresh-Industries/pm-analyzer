// Build Agent - Generates code using OpenHands

import { createPR } from "./github";
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';

export interface AgentSpec {
  title: string;
  summary: string;
  type: 'BUG' | 'FEATURE';
  details: any;
}

export interface AgentResult {
  githubPrUrl: string;
  logs: string;
}

// Common components the Build Agent can install
const COMMON_COMPONENTS = {
  feedback: {
    name: 'Feedback Widget',
    description: 'In-app feedback collection with sentiment analysis',
    files: [
      'components/FeedbackWidget.tsx',
      'app/api/projects/[id]/agents/feedback/route.ts',
      'lib/agents/feedback-agent.ts',
    ],
    installCommand: 'copy feedback-kit/',
    readme: 'feedback-kit/README.md',
  },
  auth: {
    name: 'Authentication',
    description: 'Better Auth integration with Google/GitHub providers',
    files: [
      'lib/auth-client.ts',
      'app/api/auth/[...nextauth]/route.ts',
    ],
    installCommand: 'npx create-next-auth@latest',
  },
  database: {
    name: 'Database Schema',
    description: 'Prisma with PostgreSQL schema',
    files: [
      'prisma/schema.prisma',
      'lib/prisma.ts',
    ],
    installCommand: 'npx prisma init',
  },
};

export async function runOpenHandsAgent(spec: AgentSpec, repo: string): Promise<AgentResult> {
  const openHandsUrl = process.env.OPENHANDS_API_URL;
  
  if (!openHandsUrl) {
    console.warn("OPENHANDS_API_URL not set, mocking agent run");
    return {
      githubPrUrl: "https://github.com/example/repo/pull/123",
      logs: "Mock execution logs...",
    };
  }

  try {
    const response = await fetch(`${openHandsUrl}/api/v1/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENHANDS_TOKEN}`
      },
      body: JSON.stringify({
        repo,
        task: `Implement the following spec:\n\n${JSON.stringify(spec, null, 2)}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenHands API failed: ${response.statusText}`);
    }

    const data = await response.json();
    let githubPrUrl = data.pr_url;

    if (!githubPrUrl && data.branch) {
      githubPrUrl = await createPR(repo, spec.title, spec.summary || "Automated PR", data.branch);
    }

    return {
      githubPrUrl,
      logs: data.logs || "",
    };
  } catch (error) {
    console.error("Agent run failed:", error);
    throw error;
  }
}

// Detect if spec is for a common component
export function detectCommonComponent(details: any): keyof typeof COMMON_COMPONENTS | null {
  const text = JSON.stringify(details).toLowerCase();
  
  if (text.includes('feedback') && (text.includes('widget') || text.includes('button'))) {
    return 'feedback';
  }
  
  if (text.includes('auth') || text.includes('login') || text.includes('signup')) {
    return 'auth';
  }
  
  if (text.includes('database') || text.includes('schema') || text.includes('prisma')) {
    return 'database';
  }
  
  return null;
}

// Quick install for common components
export async function installCommonComponent(
  component: keyof typeof COMMON_COMPONENTS,
  projectId: string
): Promise<{ success: boolean; files: string[]; message: string }> {
  const comp = COMMON_COMPONENTS[component];
  
  if (!comp) {
    return { success: false, files: [], message: 'Unknown component' };
  }

  // In real implementation, this would copy files from pm-analyzer to target project
  return {
    success: true,
    files: comp.files,
    message: `Installed ${comp.name}. Files: ${comp.files.join(', ')}`,
  };
}

// Build Agent prompt for OpenHands
export const BUILD_AGENT_PROMPT = `You are a Build Agent. Your job is to write production-quality code.

When implementing features:
1. Use TypeScript with proper typing
2. Follow Next.js App Router conventions
3. Use shadcn/ui components when available
4. Write clean, documented code
5. Include error handling
6. Test your changes

Common tasks:
- Create API routes (app/api/...)
- Create UI components (components/...)
- Add database queries (lib/prisma.ts)
- Update configurations (.env, next.config.js)

If asked to add a feedback widget:
1. Copy FeedbackWidget.tsx from the feedback-kit
2. Add it to the layout
3. Configure the projectId prop
4. Test it works

If asked to add authentication:
1. Set up Better Auth
2. Configure providers
3. Protect routes as needed

Focus on quality and maintainability.`;
