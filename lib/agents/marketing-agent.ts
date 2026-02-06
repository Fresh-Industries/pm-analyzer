// Marketing Agent - Creates Landing Pages, Launch Copy, and Campaigns

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BaseAgent } from '../base-agent';
import { saveCampaignTool } from '../tools/database';
import type { MarketingInput, MarketingOutput, BuildOutput } from '../types';

const SYSTEM_PROMPT = `You are a senior growth marketer and copywriter. Your job is to:

1. Create compelling landing page copy (hero, features, social proof, CTA)
2. Generate social media launch posts (Twitter/X, LinkedIn, Hacker News)
3. Write email sequence (launch, follow-up, urgency)
4. Suggest positioning and differentiation

Use proven copywriting frameworks:
- AIDA (Attention, Interest, Desire, Action)
- Before/After/Bridge
- PAS (Problem, Agitation, Solution)

Keep copy concise, benefit-focused, and action-oriented.`;

export class MarketingAgent extends BaseAgent {
  name = 'marketing';
  description = 'Creates landing pages and launch campaigns';
  systemPrompt = SYSTEM_PROMPT;
  model = 'gpt-4o';
  
  tools = {
    save_campaign: saveCampaignTool,
  };
  
  async execute(input: MarketingInput): Promise<{
    success: boolean;
    output: MarketingOutput;
    message?: string;
  }> {
    const { build, projectId } = input;
    
    // Generate all marketing materials
    const MarketingOutputSchema = z.object({
      landingPage: z.object({
        heroHeadline: z.string(),
        heroSubheadline: z.string(),
        keyBenefits: z.array(z.string()),
        features: z.array(z.object({
          title: z.string(),
          description: z.string(),
          icon: z.string(),
        })),
        cta: z.object({
          primary: z.string(),
          secondary: z.string(),
        }),
        socialProof: z.array(z.string()),
      }),
      socialPosts: z.object({
        twitter: z.string(),
        linkedin: z.string(),
        hackerNews: z.string(),
        productHunt: z.object({
          title: z.string(),
          subtitle: z.string(),
          description: z.string(),
          tagline: z.string(),
        }),
      }),
      emailSequence: z.array(z.object({
        subject: z.string(),
        previewText: z.string(),
        body: z.string(),
        timing: z.string(), // "Day 0", "Day 1", "Day 3", etc.
      })),
      positioning: z.object({
        tagline: z.string(),
        oneLiner: z.string(),
        targetAudience: z.string(),
        mainBenefit: z.string(),
        differentiation: z.string(),
      }),
    });
    
    const prompt = `Create marketing materials for this product:

Product: ${build.title || 'Product'}
Problem it solves: ${build.problem || 'See product page'}
Solution: ${build.solution || 'Your solution'}
Key Features: ${JSON.stringify(build.features || [])}
Tech Stack: ${JSON.stringify(build.techStack || [])}

Generate comprehensive marketing materials in JSON format:
- Landing page with compelling copy
- Social media posts (Twitter, LinkedIn, HN)
- Email launch sequence (4 emails)
- Positioning statement`;

    const { object: marketing } = await generateObject({
      model: openai(this.model),
      schema: MarketingOutputSchema,
      prompt,
      system: SYSTEM_PROMPT,
    });
    
    const output: MarketingOutput = {
      landingPage: marketing.landingPage,
      socialPosts: marketing.socialPosts,
      emailSequence: marketing.emailSequence,
      positioning: marketing.positioning,
    };
    
    // Save to database
    await saveCampaignTool.execute({
      projectId,
      campaign: output,
    });
    
    return {
      success: true,
      output,
      message: `Marketing materials created for ${build.title}`,
    };
  }
}
