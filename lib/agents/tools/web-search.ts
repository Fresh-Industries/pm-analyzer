// Web Search Tool - Brave API

import { tool } from 'ai';
import { z } from 'zod';
import type { ToolDefinition } from './types';

export const webSearchTool: ToolDefinition = {
  name: 'web_search',
  description: `Search the web for information. Use this to find:
- Competitor products and pricing
- Market statistics and trends
- Customer reviews and pain points
- Technology comparisons

Returns up to 10 results with title, url, and description.`,
  
  parameters: z.object({
    query: z.string().describe('The search query'),
    numResults: z.number().default(5).describe('Number of results (max 10)'),
    freshness: z.enum(['pd', 'pw', 'pm', 'py']).default('pm').describe('Freshness: past day/week/month/year'),
  }),
  
  execute: async ({ query, numResults = 5, freshness = 'pm' }) => {
    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${numResults}&freshness=${freshness}`,
        {
          headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': process.env.BRAVE_API_KEY || '',
          },
        }
      );
      
      if (!response.ok) {
        return { success: false, error: `Search failed: ${response.statusText}` };
      }
      
      const data = await response.json();
      
      const results = (data.web?.results || []).slice(0, numResults).map((result: any) => ({
        title: result.title,
        url: result.url,
        description: result.description,
        age: result.age,
      }));
      
      return { success: true, data: { results, query } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
