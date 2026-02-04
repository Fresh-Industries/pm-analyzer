import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const specSchema = z.object({
  type: z.enum(['BUG', 'FEATURE']),
  title: z.string(),
  summary: z.string(),
  details: z.object({
    // For Bugs
    reproductionSteps: z.array(z.string()).optional(),
    expectedBehavior: z.string().optional(),
    actualBehavior: z.string().optional(),
    // For Features
    userStory: z.string().optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    technicalNotes: z.string().optional(),
  }),
});

export async function generateSpec(feedbackContent: string) {
  const prompt = `
    Analyze the following feedback and create a specification for a coding agent.
    
    Feedback:
    "${feedbackContent}"
    
    1. Classify it as a BUG or FEATURE.
    2. If it's a BUG, provide reproduction steps (inferred if necessary), expected behavior, and actual behavior.
    3. If it's a FEATURE, provide a user story, acceptance criteria, and technical notes.
    4. Provide a clear title and summary.
  `;

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: specSchema,
      prompt,
    });

    return object;
  } catch (error) {
    console.error('Error generating spec:', error);
    throw error;
  }
}
