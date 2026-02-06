// Marketing Agent - Communicates via A2A Protocol

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BaseAgent } from '../base-agent';
import { requestFromAgent, A2AActions } from '../a2a-protocol';
import { saveCampaignTool } from '../tools/database';
import type { MarketingInput, MarketingOutput } from '../types';

const SYSTEM_PROMPT = `You are a senior growth marketer. You create marketing strategies and communicate with other agents via A2A protocol.

Your responsibilities:
1. Create marketing strategy based on research
2. Generate marketing copy (headlines, benefits, CTAs)
3. Request landing page code from Build Agent
4. Request image generation prompts from Nano Banana

You communicate with:
- Research Agent: Get market insights
- Build Agent: Generate landing page code
`;

export class MarketingAgent extends BaseAgent {
  name = 'marketing';
  description = 'Creates marketing strategy and coordinates with other agents';
  systemPrompt = SYSTEM_PROMPT;
  model = 'gpt-4o';
  
  tools = {
    save_campaign: saveCampaignTool,
  };
  
  // A2A message handler (receives messages from other agents)
  async handleA2AMessage(message: {
    from: string;
    action: string;
    payload: any;
    context?: any;
  }): Promise<any> {
    switch (message.action) {
      case 'get_market_insights':
        return this.getMarketInsights(message.payload);
      
      case 'create_marketing_strategy':
        return this.createStrategy(message.payload);
      
      case 'create_campaign':
        return this.createCampaign(message.payload);
      
      default:
        return { error: `Unknown action: ${message.action}` };
    }
  }
  
  async execute(input: MarketingInput): Promise<{
    success: boolean;
    output: MarketingOutput;
    message?: string;
  }> {
    const { build, projectId, tone = 'professional' } = input;
    
    // If this is from A2A, handle it
    if (input['fromA2A']) {
      return this.handleA2AMessage(input as any);
    }

    // Standalone execution - create marketing strategy
    const strategy = await this.createStrategy({
      projectId,
      build,
      tone,
    });

    return {
      success: true,
      output: strategy,
      message: 'Marketing strategy created',
    };
  }

  // A2A: Get market insights from Research Agent
  private async getMarketInsights(payload: any): Promise<any> {
    const { projectId, productIdea } = payload;

    // Request from Research Agent via A2A
    const response = await requestFromAgent(
      'marketing',
      'research',
      'get_market_insights',
      { projectId, productIdea },
      { projectId }
    );

    if (!response.success) {
      throw new Error(`Research failed: ${response.error}`);
    }

    return response.data;
  }

  // Create marketing strategy based on research
  private async createStrategy(payload: any): Promise<MarketingOutput> {
    const { projectId, build, tone = 'professional' } = payload;

    // Generate strategy
    const StrategySchema = z.object({
      positioning: z.object({
        tagline: z.string(),
        oneLiner: z.string(),
        targetAudience: z.string(),
        mainBenefit: z.string(),
        differentiation: z.string(),
      }),
      hero: z.object({
        headline: z.string(),
        subheadline: z.string(),
        ctaPrimary: z.string(),
        ctaSecondary: z.string(),
      }),
      features: z.array(z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string(),
      })),
      pricing: z.array(z.object({
        name: z.string(),
        price: z.string(),
        period: z.string().optional(),
        description: z.string(),
        features: z.array(z.string()),
        cta: z.string(),
        popular: z.boolean().optional(),
      })),
      testimonials: z.array(z.object({
        quote: z.string(),
        author: z.string(),
        role: z.string(),
        company: z.string().optional(),
      })),
      faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
      })),
      cta: z.object({
        headline: z.string(),
        subheadline: z.string(),
        cta: z.string(),
      }),
    });

    const prompt = `Create marketing strategy for: ${build.title || 'Product'}

Product details:
- Problem: ${build.problem || 'N/A'}
- Solution: ${build.solution || 'N/A'}
- Features: ${build.features?.map((f: any) => f.name).join(', ') || 'Core features'}
- Tone: ${tone}

Generate complete marketing strategy.`;

    const { object: strategy } = await generateObject({
      model: openai(this.model),
      schema: StrategySchema,
      prompt,
      system: SYSTEM_PROMPT,
    });

    const output: MarketingOutput = {
      positioning: strategy.positioning,
      hero: strategy.hero,
      features: strategy.features,
      pricing: strategy.pricing,
      testimonials: strategy.testimonials,
      faq: strategy.faq,
      cta: strategy.cta,
      tone,
      audience: strategy.positioning.targetAudience,
    };

    // Save to database
    await saveCampaignTool.execute({
      projectId,
      campaign: output,
    });

    return output;
  }

  // A2A: Request landing page code from Build Agent
  async requestLandingPageCode(
    projectId: string,
    marketingCopy: {
      hero: { headline: string; subheadline: string };
      features: Array<{ title: string; description: string }>;
      pricing: Array<any>;
    }
  ): Promise<{ success: boolean; codeUrl?: string; error?: string }> {
    const response = await requestFromAgent(
      'marketing',
      'build',
      'generate_landing_page_code',
      {
        projectId,
        copy: marketingCopy,
      },
      { projectId }
    );

    return {
      success: response.success,
      codeUrl: response.data?.siteUrl,
      error: response.error,
    };
  }

  // Create full campaign
  private async createCampaign(payload: any): Promise<any> {
    const { projectId, build, tone } = payload;

    // 1. Get market insights from Research
    const research = await this.getMarketInsights({
      projectId,
      productIdea: build.title,
    });

    // 2. Create marketing strategy
    const strategy = await this.createStrategy({
      projectId,
      build,
      tone,
    });

    // 3. Request landing page code from Build Agent
    const landingPage = await this.requestLandingPageCode(projectId, {
      hero: strategy.hero,
      features: strategy.features,
      pricing: strategy.pricing,
    });

    return {
      research,
      strategy,
      landingPage,
    };
  }
}
