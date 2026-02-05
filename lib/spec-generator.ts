import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { DEFAULT_ANALYSIS_MODEL_ID, isAnalysisModelId } from './ai-models';

const specSchema = z.object({
  type: z.enum(['BUG', 'FEATURE']),
  title: z.string(),
  summary: z.string(),
  details: z.object({
    // For Bugs (use empty arrays/strings when not applicable)
    reproductionSteps: z.array(z.string()),
    expectedBehavior: z.string(),
    actualBehavior: z.string(),
    // For Features (use empty arrays/strings when not applicable)
    userStory: z.string(),
    acceptanceCriteria: z.array(z.string()),
    technicalNotes: z.string(),
  }),
});

function resolveModel(modelId?: string | null) {
  const envDefaultModel = process.env.DEFAULT_ANALYSIS_MODEL_ID;
  const fallbackModel = isAnalysisModelId(envDefaultModel)
    ? envDefaultModel
    : DEFAULT_ANALYSIS_MODEL_ID;
  const selectedModelId = isAnalysisModelId(modelId)
    ? modelId
    : fallbackModel;

  const [provider, model] = selectedModelId.split(':', 2);
  if (provider === 'google') return google(model);
  return openai(model);
}

export async function generateSpec(
  feedbackContent: string,
  modelId?: string | null
) {
  const prompt = `
    Analyze the following feedback and create a specification for a coding agent.
    
    Feedback:
    "${feedbackContent}"
    
    1. Classify it as a BUG or FEATURE.
    2. If it's a BUG, provide reproduction steps (inferred if necessary), expected behavior, and actual behavior.
    3. If it's a FEATURE, provide a user story, acceptance criteria, and technical notes.
    4. Provide a clear title and summary.
    5. Always include ALL fields in "details". If a field doesn't apply, use an empty string or empty array.
  `;

  try {
    const { object } = await generateObject({
      model: resolveModel(modelId),
      schema: specSchema,
      prompt,
    });

    return object;
  } catch (error) {
    console.error('Error generating spec:', error);
    throw error;
  }
}
