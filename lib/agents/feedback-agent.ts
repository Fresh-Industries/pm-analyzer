// Feedback Agent - Analyzes user feedback and suggests improvements

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BaseAgent } from '../base-agent';
import { saveFeedbackAnalysisTool } from '../tools/database';
import type { FeedbackInput, FeedbackOutput } from '../types';

const SYSTEM_PROMPT = `You are a product feedback analyst. Your job is to:

1. Analyze incoming user feedback
2. Categorize by sentiment (positive/neutral/negative)
3. Identify themes and patterns
4. Extract actionable suggestions
5. Score product-market fit (1-10)
6. Generate improvement recommendations

You communicate findings clearly with actionable insights.`;

export class FeedbackAgent extends BaseAgent {
  name = 'feedback';
  description = 'Analyzes user feedback and suggests improvements';
  systemPrompt = SYSTEM_PROMPT;
  model = 'gpt-4o';
  
  tools = {
    save_feedback_analysis: saveFeedbackAnalysisTool,
  };
  
  async execute(input: FeedbackInput): Promise<{
    success: boolean;
    output: FeedbackOutput;
    message?: string;
  }> {
    const { feedback, productInfo } = input;
    
    // Analyze feedback
    const FeedbackAnalysisSchema = z.object({
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      score: z.number().min(1).max(10),
      highlights: z.array(z.string()),
      concerns: z.array(z.string()),
      suggestions: z.array(z.object({
        item: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
        effort: z.enum(['high', 'medium', 'low']),
        reasoning: z.string(),
      })),
      themes: z.array(z.object({
        name: z.string(),
        count: z.number(),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
      })),
      rawFeedback: z.array(z.object({
        text: z.string(),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        source: z.string().optional(),
      })),
    });
    
    const prompt = `Analyze this user feedback:

Product: ${productInfo?.name || 'Product'}
Description: ${productInfo?.description || 'N/A'}

Feedback to analyze:
${feedback.map((f: any) => `- "${f.text}" [${f.source || 'unknown'}]`).join('\n')}

Provide comprehensive analysis in JSON format.`;
    
    const { object: analysis } = await generateObject({
      model: openai(this.model),
      schema: FeedbackAnalysisSchema,
      prompt,
      system: SYSTEM_PROMPT,
    });
    
    const output: FeedbackOutput = {
      sentiment: analysis.sentiment,
      score: analysis.score,
      highlights: analysis.highlights,
      concerns: analysis.concerns,
      suggestions: analysis.suggestions,
      themes: analysis.themes,
      rawFeedback: analysis.rawFeedback,
    };
    
    // Save to database
    await saveFeedbackAnalysisTool.execute({
      productId: productInfo?.id,
      analysis: output,
    });
    
    return {
      success: true,
      output,
      message: `Analyzed ${feedback.length} feedback items`,
    };
  }
}
