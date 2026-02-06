// Web Fetch Tool - Extract readable content from URLs

import { tool } from 'ai';
import { z } from 'zod';
import type { ToolDefinition } from './types';

export const webFetchTool: ToolDefinition = {
  name: 'web_fetch',
  description: `Fetch and extract readable content from a URL. Use this to:
- Read competitor landing pages
- Extract pricing information
- Get feature lists from websites
- Read documentation

Returns markdown-formatted text.`,
  
  parameters: z.object({
    url: z.string().url().describe('The URL to fetch'),
    extractMode: z.enum(['markdown', 'text']).default('markdown').describe('Content extraction format'),
    maxChars: z.number().default(10000).describe('Maximum characters to return'),
  }),
  
  execute: async ({ url, extractMode = 'markdown', maxChars = 10000 }) => {
    try {
      const response = await fetch(
        `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        // Try direct fetch
        const directResponse = await fetch(url, {
          headers: {
            'User-Agent': 'ProductBuilderAgent/1.0',
          },
        });
        
        if (!directResponse.ok) {
          return { success: false, error: `Fetch failed: ${directResponse.statusText}` };
        }
        
        const text = await directResponse.text();
        return { success: true, data: { content: text.slice(0, maxChars), url } };
      }
      
      const data = await response.json();
      const content = extractMode === 'markdown' 
        ? data.data || data.content || data.markdown || JSON.stringify(data)
        : data.text || data.content || JSON.stringify(data);
      
      return { success: true, data: { content: content.slice(0, maxChars), url } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
