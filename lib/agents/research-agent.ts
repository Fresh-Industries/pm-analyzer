// Research Agent - Market & Competitor Research

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BaseAgent } from '../base-agent';
import { webSearchTool } from '../tools/web-search';
import { webFetchTool } from '../tools/web-fetch';
import { saveResearchTool } from '../tools/database';
import type { ResearchInput, ResearchOutput, CompetitorInfo } from '../types';

const SYSTEM_PROMPT = `You are a world-class market researcher. Your job is to analyze product ideas and provide comprehensive research including:

1. Market size and trends
2. Competitor analysis with features and pricing
3. Opportunities and gaps in the market
4. Potential risks and challenges
5. Recommendations for differentiation

Be thorough, objective, and provide actionable insights. Use the tools available to you to gather real data about the market and competitors.`;

export class ResearchAgent extends BaseAgent {
  name = 'research';
  description = 'Researches markets, competitors, and opportunities';
  systemPrompt = SYSTEM_PROMPT;
  model = 'gpt-4o';
  
  tools = {
    web_search: webSearchTool,
    web_fetch: webFetchTool,
    save_research: saveResearchTool,
  };
  
  async execute(input: ResearchInput): Promise<{
    success: boolean;
    output: ResearchOutput;
    message?: string;
  }> {
    const { request, constraints } = input;
    
    // Step 1: Search for competitors
    const searchResults = await this.web_search.execute({
      query: `${request} SaaS competitors`,
      numResults: 10,
    });
    
    // Step 2: Search for market data
    const marketResults = await this.web_search.execute({
      query: `${request} market size trends 2025`,
      numResults: 5,
    });
    
    // Step 3: Analyze competitors
    const competitors: CompetitorInfo[] = [];
    
    if (searchResults.success && searchResults.data?.results) {
      for (const result of searchResults.data.results.slice(0, 5)) {
        // Fetch competitor details
        if (result.url) {
          const details = await this.web_fetch.execute({
            url: result.url,
            maxChars: 5000,
          });
          
          competitors.push({
            name: result.title,
            url: result.url,
            features: this.extractFeatures(details.data?.content || ''),
            pricing: this.extractPricing(details.data?.content || ''),
            strengths: [],
            weaknesses: [],
          });
        }
      }
    }
    
    // Step 4: Generate research output using LLM
    const ResearchOutputSchema = z.object({
      marketSize: z.string().describe('Estimated market size'),
      marketTrends: z.array(z.string()).describe('Key market trends'),
      competitors: z.array(z.object({
        name: z.string(),
        url: z.string().optional(),
        features: z.array(z.string()),
        pricing: z.string().optional(),
        strengths: z.array(z.string()).optional(),
        weaknesses: z.array(z.string()).optional(),
      })),
      opportunities: z.array(z.string()).describe('Market opportunities'),
      risks: z.array(z.string()).describe('Potential risks'),
      recommendations: z.array(z.string()).describe('Recommendations for success'),
    });
    
    const analysisPrompt = `Analyze this product idea and provide research findings:

Product Idea: ${request}
${constraints ? `Constraints: ${JSON.stringify(constraints)}` : ''}

Search Results Summary:
${JSON.stringify(searchResults.data?.results || [], null, 2)}

Market Data:
${JSON.stringify(marketResults.data?.results || [], null, 2)}

Provide comprehensive research in JSON format.`;

    const { object: analysis } = await generateObject({
      model: openai(this.model),
      schema: ResearchOutputSchema,
      prompt: analysisPrompt,
      system: SYSTEM_PROMPT,
    });
    
    const output: ResearchOutput = {
      marketSize: analysis.marketSize,
      competitors: analysis.competitors.length > 0 ? analysis.competitors : competitors,
      opportunities: analysis.opportunities,
      risks: analysis.risks,
      recommendations: analysis.recommendations,
    };
    
    return {
      success: true,
      output,
      message: `Research complete for: ${request}`,
    };
  }
  
  private extractFeatures(content: string): string[] {
    // Simple feature extraction - look for common patterns
    const features: string[] = [];
    
    // Look for feature-related keywords
    const featurePatterns = [
      /features?:?\s*([^\.]+)/gi,
      /offers?:?\s*([^\.]+)/gi,
      /including:?([^\.]+)/gi,
    ];
    
    for (const pattern of featurePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(m => {
          const clean = m.replace(/features?:?|offers?:?|including:?/gi, '').trim();
          if (clean.length > 3) {
            features.push(clean.slice(0, 100));
          }
        });
      }
    }
    
    return [...new Set(features)].slice(0, 10);
  }
  
  private extractPricing(content: string): string {
    // Look for pricing patterns
    const pricingPatterns = [
      /\$\d+\/mo/gi,
      /\$\d+\/month/gi,
      /starting at \$\d+/gi,
      /free tier/gi,
      /paid plans/gi,
    ];
    
    for (const pattern of pricingPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Pricing not found';
  }
}
