import { z } from "zod";

// Mock implementation for AI structured output generation
export async function generateStructuredOutput<T extends z.ZodSchema>({
  model,
  prompt,
  schema,
}: {
  model: string;
  prompt: string;
  schema: T;
}): Promise<z.infer<T>> {
  console.log(`[MOCK AI] Generating structured output with model: ${model}`);
  console.log(`[MOCK AI] Prompt excerpt: ${prompt.substring(0, 50)}...`);

  // Simple mock output based on the DecisionDraftSchema
  const mockOutput = {
    title: "Implement Streamlined Decision Workflow for PM Analyzer",
    summary: "The current decision process is too manual and the interface is confusing. This feature will streamline the process from analysis to handoff, automatically generating decision briefs and providing one-click integration buttons for Linear and Slack.",
    scope: "New Decision model structure. New /api/projects/[id]/decisions/generate endpoint. Redesigned /dashboard and /projects/[id]/decisions/[id] pages. Integration buttons for Linear and Slack URL schemas.",
    nonGoals: "Full integration with Cursor's proprietary API (will use clipboard copy for now). Full rebuild of the Feedback Upload page. Advanced cluster/theming logic for decision grouping (simple batching for now).",
    acceptanceCriteria: "- A 'Draft' decision is auto-created after feedback is analyzed.\n- The Dashboard only shows Upload and Recent Decisions.\n- The Decision Detail page contains functioning Linear and Slack handoff buttons.\n- The Analysis page correctly shows the 'Top 3 Opportunities'.",
    risks: "Potential for poor quality AI-generated drafts, leading to manual rework. Handoff URL formats might change. Risk of breaking existing routing by cleaning up old pages.",
    confidenceScore: 95,
  };

  try {
    return schema.parse(mockOutput) as z.infer<T>;
  } catch (e) {
    console.error("Mock output failed schema validation:", e);
    throw new Error("Mock AI Failed");
  }
}

/**
 * Placeholder for other AI utilities (e.g., raw text generation)
 */
export async function generateText({
  model,
  prompt,
}: {
  model: string;
  prompt: string;
}): Promise<string> {
    return `[MOCK AI] Generated text for model ${model}: ${prompt}`;
}