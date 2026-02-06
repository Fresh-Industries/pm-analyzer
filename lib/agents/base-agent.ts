// Base Agent Class - Foundation for all agents

import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, tool } from 'ai';
import { z } from 'zod';
import type { AgentMessage, ToolDefinition } from './types';

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  model?: string;
}

export interface AgentResult {
  success: boolean;
  output: Record<string, any>;
  message?: string;
  toolCalls?: any[];
}

export abstract class BaseAgent {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  
  constructor(config: AgentConfig) {
    this.name = config.name;
    this.description = config.description;
    this.systemPrompt = config.systemPrompt;
    this.model = config.model || 'gpt-4o';
  }
  
  abstract tools: Record<string, ToolDefinition>;
  abstract execute(input: Record<string, any>): Promise<AgentResult>;
  
  protected async callModel(prompt: string, schema?: z.ZodType<any>): Promise<any> {
    const options: any = {
      model: this.model,
      system: this.systemPrompt,
      prompt,
    };
    
    if (schema) {
      const { object } = await generateObject({
        ...options,
        schema,
      });
      return object;
    }
    
    const { text } = await generateText(options);
    return text;
  }
  
  protected createToolCall(name: string, args: Record<string, any>): ToolDefinition {
    return this.tools[name] || null;
  }
}
